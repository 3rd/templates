import "./index.css";

const el = document.createElement("div");
el.classList.add("bg-red-500", "text-white", "p-4");
el.innerHTML = "Hello World";
document.body.append(el);
