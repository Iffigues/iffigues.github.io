function GetPdfList(paths: string[]): string[] {
  return paths;
}

// Rendre accessible dans le navigateur
(window as any).GetPdfList = GetPdfList;

