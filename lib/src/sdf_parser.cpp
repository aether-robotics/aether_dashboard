#include "model.h"
#include "math_utils.h"
#include "../third_party/tinyxml2/tinyxml2.h"
#include <cstring>
#include <cstdlib>
#include <cstdio>

/* ── helpers ──────────────────────────────────────────────────────────────── */

/* Parse "x y z roll pitch yaw" from element text.  Missing values stay 0. */
static void parse_pose(const tinyxml2::XMLElement* el,
                       float& x, float& y, float& z,
                       float& roll, float& pitch, float& yaw) {
    x = y = z = roll = pitch = yaw = 0.0f;
    if (!el) return;
    const char* txt = el->GetText();
    if (!txt) return;
    sscanf(txt, "%f %f %f %f %f %f", &x, &y, &z, &roll, &pitch, &yaw);
}

static Mat4 pose_to_mat4(const tinyxml2::XMLElement* el) {
    float x, y, z, r, p, yw;
    parse_pose(el, x, y, z, r, p, yw);
    return mat4_from_pose(x, y, z, r, p, yw);
}

static Vec3 parse_xyz(const tinyxml2::XMLElement* el) {
    Vec3 v = {1.0f, 0.0f, 0.0f};
    if (!el) return v;
    const char* txt = el->GetText();
    if (txt) sscanf(txt, "%f %f %f", &v[0], &v[1], &v[2]);
    return v;
}

static JointType parse_joint_type(const char* s) {
    if (!s) return JointType::FIXED;
    if (strcmp(s, "revolute")   == 0) return JointType::REVOLUTE;
    if (strcmp(s, "prismatic")  == 0) return JointType::PRISMATIC;
    if (strcmp(s, "continuous") == 0) return JointType::CONTINUOUS;
    return JointType::FIXED;
}

/* ── SDF parser ───────────────────────────────────────────────────────────── */

/*
 * Gazebo-exported SDF stores each link's <pose> in the MODEL frame
 * (absolute, at q=0), not relative to its parent.
 *
 * Algorithm:
 *  1. Collect every link name + its model-frame Mat4.
 *  2. Collect every joint (parent, child, type, axis).
 *  3. For each joint compute T_parent_joint = inv(T_world_parent) * T_world_child.
 *  4. Find the root link (no joint has it as a child).
 *  5. Build the Link tree.
 */
RobotModel* parse_sdf(const char* xml) {
    tinyxml2::XMLDocument doc;
    if (doc.Parse(xml) != tinyxml2::XML_SUCCESS) return nullptr;

    auto* sdf_el   = doc.FirstChildElement("sdf");
    if (!sdf_el) return nullptr;
    auto* model_el = sdf_el->FirstChildElement("model");
    if (!model_el) return nullptr;

    auto* mdl = new RobotModel();
    const char* mname = model_el->Attribute("name");
    mdl->name = mname ? mname : "robot";

    /* ── Pass 1: collect link world-frame poses ─────────────────────────── */
    std::unordered_map<std::string, Mat4> link_world;

    for (auto* el = model_el->FirstChildElement("link"); el;
         el = el->NextSiblingElement("link")) {
        const char* lname = el->Attribute("name");
        if (!lname) continue;

        auto* pose_el = el->FirstChildElement("pose");
        Mat4 T = pose_to_mat4(pose_el);
        link_world[lname] = T;

        Link lk;
        lk.name = lname;

        /* collect visuals */
        for (auto* v_el = el->FirstChildElement("visual"); v_el;
             v_el = v_el->NextSiblingElement("visual")) {
            auto* geom = v_el->FirstChildElement("geometry");
            if (!geom) continue;
            auto* mesh = geom->FirstChildElement("mesh");
            if (!mesh) continue;
            auto* uri_el = mesh->FirstChildElement("uri");
            if (!uri_el || !uri_el->GetText()) continue;

            Visual vis;
            vis.uri          = uri_el->GetText();
            auto* vpose_el   = v_el->FirstChildElement("pose");
            vis.local_matrix = pose_to_mat4(vpose_el);
            lk.visuals.push_back(vis);
        }

        int idx = static_cast<int>(mdl->links.size());
        mdl->link_index[lname] = idx;
        mdl->links.push_back(std::move(lk));
    }

    /* ── Pass 2: collect joints ─────────────────────────────────────────── */
    std::unordered_map<std::string, bool> has_parent;

    for (auto* el = model_el->FirstChildElement("joint"); el;
         el = el->NextSiblingElement("joint")) {
        const char* jname  = el->Attribute("name");
        const char* jtype  = el->Attribute("type");
        if (!jname) continue;

        auto* parent_el = el->FirstChildElement("parent");
        auto* child_el  = el->FirstChildElement("child");
        if (!parent_el || !child_el) continue;

        const char* plink = parent_el->GetText();
        const char* clink = child_el->GetText();
        if (!plink || !clink) continue;

        Joint jnt;
        jnt.name        = jname;
        jnt.parent_link = plink;
        jnt.child_link  = clink;
        jnt.type        = parse_joint_type(jtype);

        /* axis (in child link frame) */
        auto* axis_el = el->FirstChildElement("axis");
        if (axis_el) {
            auto* xyz_el = axis_el->FirstChildElement("xyz");
            jnt.axis = parse_xyz(xyz_el);

            auto* limit_el = axis_el->FirstChildElement("limit");
            if (limit_el) {
                auto* lo = limit_el->FirstChildElement("lower");
                auto* hi = limit_el->FirstChildElement("upper");
                if (lo && lo->GetText()) jnt.lower = static_cast<float>(atof(lo->GetText()));
                if (hi && hi->GetText()) jnt.upper = static_cast<float>(atof(hi->GetText()));
            }
        }

        /* T_parent_joint = inv(T_world_parent) * T_world_child */
        auto it_p = link_world.find(plink);
        auto it_c = link_world.find(clink);
        if (it_p != link_world.end() && it_c != link_world.end()) {
            Mat4 inv_parent = mat4_rigid_inverse(it_p->second);
            jnt.T_parent_joint = mat4_mul(inv_parent, it_c->second);
        } else {
            jnt.T_parent_joint = mat4_identity();
        }

        has_parent[clink] = true;
        int jidx = static_cast<int>(mdl->joints.size());
        mdl->joint_index[jname] = jidx;
        mdl->joints.push_back(std::move(jnt));
    }

    /* ── Pass 3: wire tree ──────────────────────────────────────────────── */
    for (int ji = 0; ji < static_cast<int>(mdl->joints.size()); ++ji) {
        const Joint& jnt = mdl->joints[ji];

        auto it_c = mdl->link_index.find(jnt.child_link);
        auto it_p = mdl->link_index.find(jnt.parent_link);
        if (it_c != mdl->link_index.end())
            mdl->links[it_c->second].parent_joint_idx = ji;
        if (it_p != mdl->link_index.end())
            mdl->links[it_p->second].child_joint_indices.push_back(ji);
    }

    /* ── Find root ──────────────────────────────────────────────────────── */
    for (auto& lk : mdl->links) {
        if (lk.parent_joint_idx == -1) {
            mdl->root_link = lk.name;
            break;
        }
    }

    return mdl;
}
