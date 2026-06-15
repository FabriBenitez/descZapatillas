async function test() {
  try {
    const url = "http://localhost:3000/producto/stockcenter-PU310957-07";
    console.log("Fetching", url);
    const res = await fetch(url);
    console.log("Status:", res.status);
    const text = await res.text();
    console.log("Length of response:", text.length);
    if (res.status >= 400) {
      console.log("Response (first 1000 chars):", text.substring(0, 1000));
    }
  } catch (error) {
    console.error("HTTP Fetch Error:", error);
  }
}

test();



