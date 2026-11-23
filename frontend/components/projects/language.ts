
export function getLanguageFromFileName(fileName: string): string {
  const parts = fileName.split('.');
  const extension = parts[parts.length - 1].toLowerCase();
  switch (extension) {
    case 'ts':
      return 'typescript';
    case 'tsx':
      return 'typescript';
    case 'js':
      return 'javascript';
    case 'jsx':
      return 'javascript';
    case 'css':
        return 'css';
    case 'html':
        return 'html';
    case 'json':
        return 'json';
    case 'md':
        return 'markdown';
    case "py":
      return "python";
    case "c":
      return "c";
    case "cpp":
      return "cpp";
    case "java":
      return "java";
    case "go":
      return "go";
    case "rs":
      return "rust";
    case "php":
      return "php";
    default:
      return 'plaintext';
  }
}