"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WorkspaceInfo = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const WorkspaceInfo = ({ workspaceId, lastUpdated, }) => ((0, jsx_runtime_1.jsx)("div", { className: "bg-white/15 backdrop-blur-md rounded-2xl p-6 mb-10 border border-white/25 shadow-xl", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center justify-between", children: [(0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsxs)("h2", { className: "text-white text-2xl font-bold mb-2", children: ["\uD83D\uDCCA Workspace: ", (0, jsx_runtime_1.jsx)("span", { className: "text-blue-200", children: workspaceId })] }), lastUpdated && ((0, jsx_runtime_1.jsxs)("p", { className: "text-blue-100 text-lg font-medium", children: ["Last updated: ", lastUpdated.toLocaleTimeString()] }))] }), (0, jsx_runtime_1.jsx)("div", { className: "text-4xl", children: "\uD83D\uDE80" })] }) }));
exports.WorkspaceInfo = WorkspaceInfo;
