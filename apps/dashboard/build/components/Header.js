"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Header = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
const Header = ({ title, subtitle }) => ((0, jsx_runtime_1.jsxs)("div", { className: "text-center mb-12", children: [(0, jsx_runtime_1.jsx)("h1", { className: "text-5xl md:text-6xl font-bold text-white mb-4 drop-shadow-lg", children: title }), (0, jsx_runtime_1.jsx)("p", { className: "text-xl md:text-2xl text-blue-100 font-medium max-w-3xl mx-auto leading-relaxed", children: subtitle })] }));
exports.Header = Header;
