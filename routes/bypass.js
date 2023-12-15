const express = require("express");
const router = express.Router();
const db = require("../services/mongodb");

router.post("/submit", async (req, res) => {
  console.log(req.body);
  const result = await db.insertOne("custom", {
    string: req.body.string,
    label: req.body.label,
  });

  return res.send(`
      <script>
          window.location.href = "${process.env.BACK_END_URL}/bypass"; 
      </script>
`);
});
router.get("/", async (req, res) => {
  const page_limit = parseInt(req.query.limit || 10);
  let configs = (await db.find("custom", {}))
    .project({ string: 1, _id: 0, label: 1 })
    .limit(page_limit)
    .sort({ _id: -1 });
  configs = await configs.toArray();
  console.log(configs);
  configs = configs
    .map((config) => `<a href=${config.string}>${config.label || "link"}</a>`)
    .join("<br></br>----<br></br>");
  const form = `
 <form action=${process.env.BACK_END_URL}/bypass/submit method="post" >
 <label for="string">link</label>
 <input id="string" name="string"   type="text" /> 
 <label for="label">label</label>
 <input id="label" name="label"   type="text" /> 
 <button type="submit">add</button>
</form>
  `;
  configs += form;
  return res.send(configs);
});

module.exports = router;
