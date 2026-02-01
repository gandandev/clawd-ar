import "./style.css";
import { ARApp } from "./ARApp";

document.querySelector<HTMLDivElement>("#app")!.innerHTML = `
  <div id="overlay">
    <h1>Claw'd AR</h1>
    <p>Find some floor space and tap 'Enter AR'.</p>
  </div>
`;

const app = new ARApp();
app.init();
