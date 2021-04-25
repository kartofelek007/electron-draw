let count = 0;

export function tooltip(text) {
    const div = document.createElement("div");
    div.innerHTML = `
        <div class="tooltip-text">
            ${text}
        </div>
        <button class="tooltip-close">
            Close
        </button>
    `;

    const btn = div.querySelector("button");
    btn.addEventListener("click", () => {
       btn.parentElement.remove();
    });

    div.classList.add("tooltip");
    document.body.append(div);
    setTimeout(() => {
        div.remove();
    }, 6000);
}