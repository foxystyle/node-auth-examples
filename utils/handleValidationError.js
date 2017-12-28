function handleValidationError(err, res, callback = null){
  const messages = []
  for (let field in err.errors) {
    messages.push(err.errors[field].message)
    callback && callback(err.errors[field].message)
  }
  res.status(422).json({ messages })
  return messages
}

module.exports = handleValidationError
