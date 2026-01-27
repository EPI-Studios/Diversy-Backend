export default function createCode(): string {
  let length = 6;
  let characters = "abcedfghijklmnopqrsuvwxyz0123456789".toUpperCase();

  let code = "";
  for (let i = 0; i < length; i++) {
    let randomIndex = Math.floor(Math.random() * characters.length);
    code += characters.charAt(randomIndex);
  }
  return code;
}
