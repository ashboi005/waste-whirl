export default function HowItWorks() {
  return (
    <section id="how-it-works">
      <h2>How it works</h2>
      <div className="steps-container">
        {[
          { src: '/static/images/planner.png', label: 'Schedule a pickup' },
          { src: '/static/images/del.png', label: 'Pickup at your address' },
          { src: '/static/images/credit.png', label: 'Receive payment' },
        ].map((step, index) => (
          <div className="step-card" key={index}>
            <img src={step.src} alt={step.label} />
            <h3>{step.label}</h3>
          </div>
        ))}
      </div>
    </section>
  );
} 