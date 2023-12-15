const express = require("express");
const router = express.Router();
const db = require("../services/mongodb");

// router.get("/new", async (req, res) => {
//   const html = `
//  <form action=${process.env.BACK_END_URL}/bypass/submit method="post">
//  <input id="string" name="string"   type="text" /> <button type="submit">add</button>
// </form>
//  `;
//   return res.send(html);
// });
router.post("/submit", async (req, res) => {
  const result = await db.insertOne("custom", { string: req.body.string });

  return res.send(`
      <script>
          window.location.href = "${process.env.BACK_END_URL}/bypass"; 
      </script>
`);
});
router.get("/", async (req, res) => {
  const page_limit = parseInt(req.query.limit || 10);
  let configs = (await db.find("custom", {}))
    .project({ string: 1, _id: 0 })
    .limit(page_limit)
    .sort({ _id: -1 });
  configs = await configs.toArray();

  configs = configs
    .map((config) => `<a>${config.string}</a>`)
    .join("<br></br><br></br>");
  const form = `
 <form action=${process.env.BACK_END_URL}/bypass/submit method="post" >
 <input id="string" name="string"   type="text" /> <button type="submit">add</button>
</form>
  `;
  configs += form;
  return res.send(configs);
});

module.exports = router;
