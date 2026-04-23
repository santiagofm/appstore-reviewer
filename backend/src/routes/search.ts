import { Router } from "express";

const router = Router();

interface ItunesResult {
  trackId: number;
  trackName: string;
  artworkUrl60: string;
  sellerName: string;
}

interface ItunesResponse {
  results: ItunesResult[];
}

router.get("/", async (req, res) => {
  const term = req.query.term as string | undefined;
  if (!term?.trim()) {
    return res
      .status(400)
      .json({ error: "Missing required query param: term" });
  }

  const url = `https://itunes.apple.com/search?term=${encodeURIComponent(term)}&entity=software&limit=10`;
  try {
    const response = await fetch(url);
    if (!response.ok)
      throw new Error(`iTunes API responded with ${response.status}`);
    const data = (await response.json()) as ItunesResponse;
    res.json(
      data.results.map((r) => ({
        appId: String(r.trackId),
        name: r.trackName,
        seller: r.sellerName,
        icon: r.artworkUrl60,
      })),
    );
  } catch (err) {
    res.status(502).json({ error: `Search failed: ${String(err)}` });
  }
});

export default router;
