import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Sanctuary() {
  return (
    <>
      <Navbar />
      
      <main style={{ minHeight: "80vh", paddingTop: "5rem" }}>
        <div className="section-divider" id="about">
          <span className="ornament left">&#10086;</span>
          <h2>The Sanctuary</h2>
          <span className="ornament right">&#10086;</span>
        </div>

        <section style={{ marginBottom: "4rem", padding: "0 1rem" }}>
          <div className="about-content">
            <h3 style={{ fontSize: "1.8rem", color: "var(--accent-color)", marginBottom: "1rem", fontFamily: "var(--font-heading)" }}>Craven Calm</h3>
            <p>
              Born from a quiet obsession with the spaces between sound and silence, Craven Calm is a sanctuary for the weary mind. 
              Our compositions are meticulously crafted to bypass the analytical brain and speak directly to the deeper, shadowed parts of the soul.
            </p>
            <p>
              Drawing inspiration from crumbling gothic architecture, fog-drenched forests, and the flickering glow of a single candle at midnight, 
              we weave heavy drones and hypnotic ambient textures intended for meditation, deep study, and the quiet hours of introspection. 
            </p>
            <p style={{ fontStyle: "italic", textAlign: "center", marginTop: "2rem" }}>
              Leave the chaos of the waking world behind.<br/>Find your inner peace in the dark.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
