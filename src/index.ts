import GrafoLista from "./GrafoLista";
import GrafoMatriz from "./GrafoMatriz";
import * as fs from "fs";

function main() {
  const caminhoArquivo = "./src/arquivos/C4000-260-X.txt";
  // const caminhoArquivo = "./src/arquivos/k5.txt";
  // const caminhoArquivo = "./src/arquivos/k33.txt";
  // const caminhoArquivo = "./src/arquivos/kquase5.txt";
  // const caminhoArquivo = "./src/arquivos/r250-66-65.txt";
  // const caminhoArquivo = "./src/arquivos/r1000-234-234.txt";

  console.log("--- Grafo ---");
  var grafo = new GrafoLista(false, false);
  grafo.carregarArquivo(caminhoArquivo);
  // grafo.forcaBruta();
  grafo.welshPowell();
  // grafo.dsatur();
  // grafo.heuristicaSimples();
  //grafo.buscaEmLargura(1);
  //grafo.buscaEmProfundidade(1);
  //grafo.dijkstra(1);

  // // Exportar os dados do grafo para JSON
  // const dadosGrafo = grafo.exportarParaJSON();
  // fs.writeFileSync("grafo.json", JSON.stringify(dadosGrafo, null, 2));
  // console.log("Dados do grafo exportados para grafo.json");
}

main();
