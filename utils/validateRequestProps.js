const validateRequestProps = {
  // Warning: Use only for public values!
  headers(req, res, opt) {
    for (const key in opt) {
      if (opt.hasOwnProperty(key)) {
        if (!req.headers[key]) return res.status(400).json({ message: `Missing ${key} header` })
        if (req.headers[key] !== opt[key]) return res.status(415).json({ message: `Invalid ${key}, expected ${opt[key]}, given ${req.headers['content-type']}` })
      }
    }
  },

  body(req, res, props) {
    for (const prop of props) {
      if (!req.body[prop]) return res.status(422).json({ message: `Request body missing '${prop}' property`, payload: prop })
    }
  },
}

module.exports = validateRequestProps
