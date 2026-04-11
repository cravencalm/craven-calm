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
              Craven Calm is built around a simple idea: exploring the space between sound and silence. It’s a quiet place for slowing down, letting go of noise, and turning inward.
            </p>
            <p>
              Inspired by gothic ruins, foggy forests, and the soft glow of candlelight, we create slow, immersive ambient music using deep drones and gentle textures. The work is made for calm moments—meditation, focus, and reflection.
            </p>
            <p>
              Alongside music, Craven Calm also creates visual art shaped by the same mood and influences, extending that atmosphere into something you can see as well as hear.
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
