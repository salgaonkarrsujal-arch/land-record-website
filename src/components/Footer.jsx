import { footerColumns } from "../data/siteContent";

function Footer() {
  return (
    <footer className="site-footer">
      <div className="container footer-top">
        <div className="footer-brand">
          <img className="brand-logo footer-logo" src="academy-seal.png" alt="Land Records Training Academy seal" />
          <span className="brand-text">
            <strong>Land Records</strong>
            <small>Training Academy</small>
          </span>
        </div>
        <div className="footer-columns">
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4>{column.title}</h4>
              {column.links.map((link) => (
                <a href="/" key={link} onClick={(event) => event.preventDefault()}>
                  {link}
                </a>
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="container footer-bottom">
        <span>© 2026 Land Records Training Academy. All rights reserved.</span>
        <div className="social-row">
          <span>t</span>
          <span>in</span>
          <span>w</span>
          <span>f</span>
        </div>
      </div>
    </footer>
  );
}

export default Footer;
