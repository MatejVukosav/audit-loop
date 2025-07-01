"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LoadingState = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const LoadingState = () => ((0, jsx_runtime_1.jsxs)("div", { className: "bg-white/95 backdrop-blur-sm rounded-3xl p-16 text-center shadow-2xl border border-white/30", children: [(0, jsx_runtime_1.jsx)("div", { className: "text-6xl mb-6 animate-pulse", children: "\u23F3" }), (0, jsx_runtime_1.jsx)("h3", { className: "text-2xl font-semibold text-gray-700 mb-3", children: "Loading metrics..." }), (0, jsx_runtime_1.jsx)("p", { className: "text-lg text-gray-500 font-medium", children: "Fetching real-time data from your workspace" })] }));
exports.LoadingState = LoadingState;
