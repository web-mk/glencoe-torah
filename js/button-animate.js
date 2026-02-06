const buttons = document.querySelectorAll(".btn");

buttons.forEach((btn) => {
  const bg = btn.querySelector(".btn__bg");

  btn.addEventListener("mouseenter", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const topLeft = Math.hypot(x, y);
    const topRight = Math.hypot(rect.width - x, y);
    const bottomLeft = Math.hypot(x, rect.height - y);
    const bottomRight = Math.hypot(rect.width - x, rect.height - y);

    const maxDistance = Math.max(topLeft, topRight, bottomLeft, bottomRight);

    const scale = maxDistance / 10;

    bg.style.left = `${x}px`;
    bg.style.top = `${y}px`;
    bg.style.transform = `translate(-50%, -50%) scale(${scale})`;
  });

  btn.addEventListener("mouseleave", (e) => {
    const rect = btn.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    bg.style.left = `${x}px`;
    bg.style.top = `${y}px`;
    bg.style.transform = "translate(-50%, -50%) scale(0)";
  });
});
