export const translateText = async (text, from, to) => {
  if (from === to) return text;
  try {
    const res = await fetch("https://api.kelvim.com/translate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        q: text,
        source: from,
        target: to,
        format: "text"
      }),
    });
    const data = await res.json();
    return data.translatedText;
  } catch (err) {
    return text; // fallback en caso de error
  }
};