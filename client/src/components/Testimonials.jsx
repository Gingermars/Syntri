import React, { useRef, useState } from "react";

const Testimonials = () => {
  const [tooltip, setTooltip] = useState({
    visible: false,
    x: 0,
    y: 0,
    text: "",
  });
  const cardRefs = useRef([]);
  const tooltipRef = useRef(null);
  const rafRef = useRef(null);

  const handleMouseMove = (e, index) => {
    const el = cardRefs.current[index];
    if (!el) return;
    const bounds = el.getBoundingClientRect();
    const x = e.clientX - bounds.left + 8;
    const y = e.clientY - bounds.top + 8;

    // only set visibility/text in state when needed
    setTooltip((t) =>
      t.visible && t.text === testimonials[index].name
        ? t
        : { visible: true, x: 0, y: 0, text: testimonials[index].name }
    );

    // batch DOM updates via rAF and apply transform (GPU-accelerated)
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => {
      if (tooltipRef.current) {
        tooltipRef.current.style.transform = `translate3d(${x}px, ${y}px, 0)`;
      }
    });
  };

  const handleMouseLeave = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    setTooltip((t) => ({ ...t, visible: false }));
  };

  const testimonials = [
    {
      name: "John Doe",
      title: "Frontend Developer",
      rating: 4,
      message:
        "Integrating this component into our project was seamless and saved us countless hours of development and testing. Highly recommended!",
      image:
        "https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200",
    },
    {
      name: "Jane Smith",
      title: "Full Stack Engineer",
      rating: 5,
      message:
        "This solution not only simplified our workflow but also improved our UI consistency across the board. Excellent tool for modern teams.",
      image:
        "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?q=80&w=200",
    },
    {
      name: "Bonnie Green",
      title: "UX Designer",
      rating: 4,
      message:
        "I was impressed with how intuitive and flexible the design was. It allowed us to rapidly prototype and launch features with confidence.",
      image:
        "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?q=80&w=200&h=200&auto=format&fit=crop",
    },
  ];

  return (
    <>
      <div className="flex flex-col items-center justify-center min-h-screen py-12 px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-[#94A3B8]">
            What our clients say
          </h2>
          <p className="mt-4 text-lg text-gray-300">
            We take pride in delivering exceptional service and solutions. But
            don't just take our word for it - hear what our clients have to say!
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              ref={(el) => (cardRefs.current[index] = el)}
              onMouseMove={(e) => handleMouseMove(e, index)}
              onMouseLeave={handleMouseLeave}
              className="relative border border-gray-200 rounded-lg overflow-hidden max-w-sm transition-all duration-300 hover:shadow-[4px_4px_30px_rgba(0,240,255,0.18)] hover:border-primary/30  hover:ring-2 hover:ring-primary/15 hover:scale-[1.005]"
            >
              {/* render tooltip element once and control visibility via state + transform */}
              {tooltip.visible && tooltip.text === testimonial.name && (
                <span
                  ref={tooltipRef}
                  className="absolute px-2.5 py-1 text-sm rounded whitespace-nowrap bg-cyan-600 text-white pointer-events-none transition-opacity duration-200 will-change-transform"
                  style={{
                    transform: `translate3d(${tooltip.x}px, ${tooltip.y}px, 0)`,
                    opacity: 1,
                  }}
                >
                  {tooltip.text}
                </span>
              )}

              <div className="flex flex-col items-center justify-center p-8 text-center">
                <div className="mb-4 text-gray-500">
                  <h3 className="text-lg font-semibold text-[#94A3B8]">
                    Very easy to integrate
                  </h3>
                  <p className="my-4 text-sm line-clamp-3">
                    {testimonial.message}
                  </p>
                  <hr />

                  {/* Rating stars */}
                  <div className="flex justify-center mt-2">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span
                        key={i}
                        className={`text-lg ${
                          i < testimonial.rating
                            ? "text-primary"
                            : "text-gray-300"
                        }`}
                      >
                        ★
                      </span>
                    ))}
                  </div>
                </div>

                <div className="flex items-center justify-center">
                  <img
                    className="rounded-full w-9 h-9"
                    src={testimonial.image}
                    alt={`${testimonial.name} profile`}
                  />
                  <div className="space-y-0.5 font-medium text-left ml-3">
                    <p>{testimonial.name}</p>
                    <p className="text-sm text-gray-500">{testimonial.title}</p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Testimonials;
