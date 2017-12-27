function handleValidationError(err, res, consoleLog = false){
  const messages = []
  for (let field in err.errors) {
    messages.push(err.errors[field].message)
    consoleLog && console.log(err.errors[field].message)
  }
  res.status(422).json({ messages })
}

module.exports = handleValidationError
