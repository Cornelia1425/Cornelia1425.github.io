import React, { useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

const CONTACT_EMAIL = 'yiranshu11@gmail.com';
const FORM_ACTION = `https://formsubmit.co/${CONTACT_EMAIL}`;

const Contact: React.FC = () => {
  const [params] = useSearchParams();
  const sent = params.get('sent') === '1';

  const nextUrl = useMemo(() => {
    if (typeof window === 'undefined') return '';
    const { origin, pathname } = window.location;
    return `${origin}${pathname}#/contact?sent=1`;
  }, []);

  return (
    <div className="contact-page">
      <div className="container about-content">
        <div className="about-hero">
          {sent && (
            <p className="contact-thanks" role="status">
              Thanks — your message was sent. I’ll get back to you soon.
            </p>
          )}

          <form className="contact-form" action={FORM_ACTION} method="POST">
            <input type="hidden" name="_subject" value="Message via yiranshu.com portfolio" />
            <input type="hidden" name="_next" value={nextUrl} />
            <input type="hidden" name="_captcha" value="false" />

            {/* Honeypot for FormSubmit */}
            <input type="text" name="_gotcha" tabIndex={-1} autoComplete="off" className="contact-honeypot" aria-hidden="true" />

            <label className="contact-label" htmlFor="contact-name">
              Name
              <input
                id="contact-name"
                className="contact-input"
                type="text"
                name="name"
                required
                autoComplete="name"
              />
            </label>

            <label className="contact-label" htmlFor="contact-email">
              Email
              <input
                id="contact-email"
                className="contact-input"
                type="email"
                name="email"
                required
                autoComplete="email"
              />
            </label>

            <label className="contact-label" htmlFor="contact-message">
              Message
              <textarea
                id="contact-message"
                className="contact-input contact-textarea"
                name="message"
                required
                rows={6}
              />
            </label>

            <button type="submit" className="contact-submit">
              Send message
            </button>

          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;
