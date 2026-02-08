"use client";

import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [directAnswer, setDirectAnswer] = useState([]);
  const [details, setDetails] = useState("");
  const [image, setImage] = useState("");
  const [loading, setLoading] = useState(false);

  // Extract main topic from question
  const extractTopic = (text) => {
    const cleaned = text
      .toLowerCase()
      .replace(/define|what is|two|three|four|uses|use|functions|function|of|the/g, "")
      .trim();
    return cleaned;
  };

  const searchWikipedia = async () => {
    if (!query) return;

    setLoading(true);
    setDirectAnswer([]);
    setDetails("");
    setImage("");

    try {
      const topic = extractTopic(query);

      const pageURL =
        "https://en.wikipedia.org/w/api.php?action=query&prop=extracts|pageimages&explaintext&piprop=original&titles=" +
        encodeURIComponent(topic) +
        "&format=json&origin=*";

      const pageRes = await fetch(pageURL);
      const pageData = await pageRes.json();

      const pages = pageData.query.pages;
      const firstPage = Object.values(pages)[0];

      if (!firstPage.extract) {
        setDirectAnswer(["No academic answer found."]);
        setLoading(false);
        return;
      }

      const fullText = firstPage.extract;
      const sentences = fullText.split(". ");

      const lowerQuery = query.toLowerCase();
      let pointsCount = 2;

      if (lowerQuery.includes("three")) pointsCount = 3;
      if (lowerQuery.includes("four")) pointsCount = 4;

      const mainPoints = sentences.slice(0, pointsCount);

      setDirectAnswer(mainPoints);
      setDetails(sentences.slice(pointsCount, pointsCount + 2).join(". "));

      if (firstPage.original) {
        setImage(firstPage.original.source);
      }

    } catch (error) {
      setDirectAnswer(["Error fetching data."]);
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-white via-gray-100 to-gray-200 text-black flex flex-col items-center px-6 py-12">

      {/* Branding */}
      <div className="absolute top-6 left-6 flex items-center gap-3">
        <div className="w-8 h-8 bg-black text-white flex items-center justify-center rounded-lg font-bold">
          S
        </div>
        <span className="text-lg font-semibold">StudyWeb</span>
      </div>

      <h1 className="text-5xl font-semibold mb-12">
        Study App
      </h1>

      {/* Search */}
      <div className="w-full max-w-3xl bg-white shadow-xl rounded-3xl p-4 flex items-center gap-4">
        <input
          type="text"
          placeholder="Ask academic question..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="flex-1 text-lg outline-none"
        />
        <button
          onClick={searchWikipedia}
          className="px-5 py-2 bg-black text-white rounded-xl hover:scale-105 transition"
        >
          Search
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div className="w-full max-w-3xl mt-8">
          <div className="h-1 bg-gray-300 rounded-full overflow-hidden">
            <div className="h-full bg-black animate-pulse w-2/3"></div>
          </div>
        </div>
      )}

      {/* Answer */}
      {!loading && directAnswer.length > 0 && (
        <div className="mt-12 max-w-5xl w-full bg-white p-10 rounded-3xl shadow-2xl flex flex-col md:flex-row gap-10">

          <div className="flex-1 space-y-6">

            <div>
              <h2 className="text-xl font-semibold mb-4">
                Direct Answer:
              </h2>
              <ul className="list-disc pl-6 space-y-2">
                {directAnswer.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            </div>

            {details && (
              <div>
                <h3 className="text-lg font-semibold mb-2">
                  Brief Explanation:
                </h3>
                <p className="text-gray-700">{details}</p>
              </div>
            )}
          </div>

          {image && (
            <div className="w-full md:w-80">
              <img
                src={image}
                alt="Topic"
                className="rounded-2xl shadow-lg"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
