/* eslint-disable */
(function () {
  const d = document,
    w = window,
    b1 = d.getElementById("NoodleZap1"),
    b2 = d.getElementById("NoodleZap2"),
    Y = ["cmVj", "ZWl2ZS0=", "b25seQ=="], // Base64-encoded: rec, eive-, only
    K = "VelvetRaven42";
  
  const decode = (base64) => {
    try {
      return atob(base64);
    } catch (e) {
      return "";
    }
  };
  
  setTimeout(() => {
    let parts = [decode(Y[0]), decode(Y[1]), decode(Y[2])];
    let domain = w.location.hostname.replace(/^www\./i, ''); // Remove www. prefix
    let email = parts[0] + parts[1] + parts[2] + "@" + domain;
    b1.onclick = () => w.navigator.clipboard.writeText(email);
    b2.onclick = () => {
      let a = d.createElement("a");
      a.href = "mailto:" + email;
      a.click();
      a.remove();
    };
  }, 100 + Math.random() * 400);
})();