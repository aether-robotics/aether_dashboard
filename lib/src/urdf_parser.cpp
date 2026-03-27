#include "model.h"
#include "math_utils.h"
#include "../third_party/tinyxml2/tinyxml2.h"
#include <cstring>
#include <cstdlib>
#include <cstdio>

/* ── helpers ──────────────────────────────────────────────────────────────── */

static Mat4 parse_origin(const tinyxml2::XMLElement* el) {
    /* URDF <origin xyz="x y z" rpy="r p y" />  -- both attributes optional */
    float x = 0, y = 0, z = 0, r = 0, p = 0, yw = 0;
    if (!el) return mat4_from_pose(x, y, z, r, p, yw);

    const char* xyz = el->Attribute("xyz");
    const char* rpy = el->Attribute("rpy");
    if (xyz) sscanf(xyz, "%f %f %f", &x, &y, &z);
    if (rpy) sscanf(rpy, "%f %f %f", &r, &p, &yw);
    return mat4_from_pose(x, y, z, r, p, yw);
}

static Vec3 parse_xyz_attr(const tinyxml2::XMLElement* el) {
    Vec3 v = {1.0f, 0.0f, 0.0f};
    if (!el) return v;
    const char* xyz = el->Attribute("xyz");
    if (xyz) sscanf(xyz, "%f %f %f", &v[0], &v[1], &v[2]);
    return v;
}

static JointType parse_type(const char* s) {
    if (!s) return JointType::FIXED;
    if (strcmp(s, "revolute")   == 0) return JointType::REVOLUTE;
    if (strcmp(s, "prismatic")  == 0) return JointType::PRISMATIC;
    if (strcmp(s, "continuous") == 0) return JointType::CONTINUOUS;
    return JointType::FIXED;
}

/* ── URDF parser ──────────────────────────────────────────────────────────── */

/*
 * In URDF every joint's <origin> is already parent-relative,
 * so T_parent_joint = mat4_from_pose(joint.origin).
 */
RobotModel* parse_urdf(const char* xml) {
    tinyxml2::XMLDocument doc;
    if (doc.Parse(xml) != tinyxml2::XML_SUCCESS) return nullptr;

    auto* robot_el = doc.FirstChildElement("robot");
    if (!robot_el) return nullptr;

    auto* mdl = new RobotModel();
    const char* rname = robot_el->Attribute("name");
    mdl->name = rname ? rname : "robot";

    /* ── Pass 1: links ──────────────────────────────────────────────────── */
    for (auto* el = robot_el->FirstChildElement("link"); el;
         el = el->NextSiblingElement("link")) {
        const char* lname = el->Attribute("name");
        if (!lname) continue;

        Link lk;
        lk.name = lname;

        /* collect visual meshes */
        for (auto* v_el = el->FirstChildElement("visual"); v_el;
             v_el = v_el->NextSiblingElement("visual")) {
            auto* geom = v_el->FirstChildElement("geometry");
            if (!geom) continue;
            auto* mesh = geom->FirstChildElement("mesh");
            if (!mesh) continue;
            const char* fname = mesh->Attribute("filename");
            if (!fname) continue;

            Visual vis;
            vis.uri = fname;
            auto* origin_el = v_el->FirstChildElement("origin");
            vis.local_matrix = parse_origin(origin_el);
            lk.visuals.push_back(vis);
        }

        int idx = static_cast<int>(mdl->links.size());
        mdl->link_index[lname] = idx;
        mdl->links.push_back(std::move(lk));
    }

    /* ── Pass 2: joints ─────────────────────────────────────────────────── */
    for (auto* el = robot_el->FirstChildElement("joint"); el;
         el = el->NextSiblingElement("joint")) {
        const char* jname = el->Attribute("name");
        const char* jtype = el->Attribute("type");
        if (!jname) continue;

        auto* parent_el = el->FirstChildElement("parent");
        auto* child_el  = el->FirstChildElement("child");
        if (!parent_el || !child_el) continue;

        const char* plink = parent_el->Attribute("link");
        const char* clink = child_el->Attribute("link");
        if (!plink || !clink) continue;

        Joint jnt;
        jnt.name        = jname;
        jnt.parent_link = plink;
        jnt.child_link  = clink;
        jnt.type        = parse_type(jtype);

        /* joint origin is parent-relative in URDF */
        auto* origin_el = el->FirstChildElement("origin");
        jnt.T_parent_joint = parse_origin(origin_el);

        /* axis */
        auto* axis_el = el->FirstChildElement("axis");
        if (axis_el) {
            jnt.axis = parse_xyz_attr(axis_el);
        } else {
            jnt.axis = {1.0f, 0.0f, 0.0f};
        }

        /* limits */
        auto* limit_el = el->FirstChildElement("limit");
        if (limit_el) {
            const char* lo = limit_el->Attribute("lower");
            const char* hi = limit_el->Attribute("upper");
            if (lo) jnt.lower = static_cast<float>(atof(lo));
            if (hi) jnt.upper = static_cast<float>(atof(hi));
        }

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
