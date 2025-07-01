"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ErrorDisplay = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const ErrorDisplay = ({ error }) => ((0, jsx_runtime_1.jsx)("div", { className: "bg-red-500/95 backdrop-blur-sm text-white p-6 rounded-2xl mb-8 border border-red-400/30 shadow-xl", children: (0, jsx_runtime_1.jsxs)("div", { className: "flex items-center", children: [(0, jsx_runtime_1.jsx)("span", { className: "text-2xl mr-3", children: "\u26A0\uFE0F" }), (0, jsx_runtime_1.jsxs)("div", { children: [(0, jsx_runtime_1.jsx)("h3", { className: "text-lg font-semibold mb-1", children: "Error" }), (0, jsx_runtime_1.jsx)("p", { className: "text-red-100", children: error })] })] }) }));
exports.ErrorDisplay = ErrorDisplay;
