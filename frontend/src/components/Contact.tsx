export default function Contact() {
  return (
    <section id="contact-us">
      <div className="contact-details">
        <div>
          <h2>CALL US</h2>
          <p className="icon">📞 +91-7009023965, +91-9814536074</p>
        </div>
        <div>
          <h2>LOCATION</h2>
          <p className="icon">📍 21 Basant Avenue, Amritsar, Punjab, 143001</p>
        </div>
        <div>
          <h2>BUSINESS HOURS</h2>
          <p className="icon">🕒 Mon – Fri : 10 am – 8 pm, Sat,Sun : Closed</p>
        </div>
      </div>

      <div className="contact-form">
        <h2>CONTACT US</h2>
        <form action="/submit_contact_form" method="post">
          <label htmlFor="name">Enter your Name</label>
          <input type="text" id="name" name="name" required />
          <label htmlFor="email">Enter a valid email address</label>
          <input type="email" id="email" name="email" required />
          <label htmlFor="message">Message</label>
          <textarea id="message" name="message" rows={4} required></textarea>
          <button type="submit">Submit</button>
        </form>
      </div>
    </section>
  );
} 