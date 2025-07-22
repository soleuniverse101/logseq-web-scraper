rootInstruction = instructionType " " url " " cssSelector ("\n" textProducer)?
instruction = instructionType " " cssSelector ("\n" textProducer)?

instructionType = "block" / "list"
url = "todo"
cssSelector = "todo"
textProducer = "todo"