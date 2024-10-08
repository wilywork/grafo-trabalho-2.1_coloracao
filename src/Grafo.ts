import fs from "fs";
export abstract class Grafo {
  direcionado: boolean;
  ponderado: boolean;
  protected vertices: string[];

  constructor(direcionado: boolean, ponderado: boolean) {
    this.direcionado = direcionado;
    this.ponderado = ponderado;
    this.vertices = [];
  }

  abstract inserirVertice(rotulo: string): boolean;

  abstract removerVertice(rotulo: string): boolean;

  abstract rotuloVertice(indice: number): string;

  abstract imprimirGrafo(): void;

  abstract inserirAresta(
    origem: number,
    destino: number,
    peso: number
  ): boolean;

  abstract removerAresta(origem: number, destino: number): boolean;

  abstract existeAresta(origem: number, destino: number): boolean;

  abstract pesoAresta(origem: number, destino: number): number;

  abstract retornarVizinhos(vertice: number): number[];

  carregarArquivo(caminhoArquivo: string): boolean {
    try {
      const dados = fs.readFileSync(caminhoArquivo, "utf-8");
      const linhas = dados.trim().split("\n");

      if (linhas.length === 0) return false;

      const [V, A, D, P] = linhas[0].split(" ").map(Number);
      this.direcionado = D === 1;
      this.ponderado = P === 1;

      for (let i = 0; i < V; i++) {
        this.inserirVertice(i.toString());
      }

      for (let i = 1; i <= A; i++) {
        if (linhas[i]) {
          const dadosAresta = linhas[i].split(" ").map(Number);
          const origem = dadosAresta[0];
          const destino = dadosAresta[1];
          const peso = this.ponderado ? dadosAresta[2] : 1;
          this.inserirAresta(origem, destino, peso);
        }
      }

      return true;
    } catch (erro) {
      console.error("Erro ao carregar o arquivo:", erro);
      return false;
    }
  }

  buscaEmLargura(verticeInicio: number): void {
    const visitados = new Set<number>();
    const fila: number[] = [];

    fila.push(verticeInicio);
    visitados.add(verticeInicio);

    console.log("Ordem de Visita BFS:");

    while (fila.length > 0) {
      const vertice = fila.shift()!;
      console.log(this.rotuloVertice(vertice));

      const vizinhos = this.retornarVizinhos(vertice);
      for (const vizinho of vizinhos) {
        if (!visitados.has(vizinho)) {
          visitados.add(vizinho);
          fila.push(vizinho);
        }
      }
    }
  }

  buscaEmProfundidade(verticeInicio: number): void {
    const visitados = new Set<number>();

    const visitarDFS = (vertice: number) => {
      visitados.add(vertice);
      console.log(this.rotuloVertice(vertice));

      const vizinhos = this.retornarVizinhos(vertice);
      for (const vizinho of vizinhos) {
        if (!visitados.has(vizinho)) {
          visitarDFS(vizinho);
        }
      }
    };

    console.log("Ordem de Visita DFS:");
    visitarDFS(verticeInicio);
  }

  dijkstra(verticeInicio: number): void {
    const distancias = new Array(this.vertices.length).fill(Infinity);
    const anteriores = new Array(this.vertices.length).fill(-1);
    const visitados = new Set<number>();

    distancias[verticeInicio] = 0;

    while (visitados.size !== this.vertices.length) {
      let u = -1;
      let menorDistancia = Infinity;

      for (let i = 0; i < distancias.length; i++) {
        if (!visitados.has(i) && distancias[i] < menorDistancia) {
          menorDistancia = distancias[i];
          u = i;
        }
      }

      if (u === -1) break;

      visitados.add(u);

      const vizinhos = this.retornarVizinhos(u);
      for (const v of vizinhos) {
        const peso = this.pesoAresta(u, v);
        if (distancias[u] + peso < distancias[v]) {
          distancias[v] = distancias[u] + peso;
          anteriores[v] = u;
        }
      }
    }

    console.log("Resultado do Algoritmo de Dijkstra:");
    for (let i = 0; i < this.vertices.length; i++) {
      console.log(
        `Vertice: ${this.rotuloVertice(i)}, Distancia: ${
          distancias[i]
        }, Anterior: ${
          anteriores[i] !== -1 ? this.rotuloVertice(anteriores[i]) : "N/A"
        }`
      );
    }
  }

  private calcularTempoExecucao(algoritmo: () => any) {
    const inicio = performance.now();
    const resultado = algoritmo();
    const fim = performance.now();
    const duracao = fim - inicio;
    console.log(`Tempo de execução: ${duracao} ms`);
    return resultado;
  }

  // Algoritmo de força bruta para coloração
  forcaBruta() {
    return this.calcularTempoExecucao(() => {
      const n = this.vertices.length;
      let cor = Array(n).fill(-1);
      let coresNecessarias = n;

      for (let numCores = 2; numCores <= n; numCores++) {
        if (this.tentarColorir(0, cor, numCores)) {
          coresNecessarias = numCores;
          break;
        }
      }

      console.log("Força Bruta");
      console.log(`Número de cores utilizadas: ${coresNecessarias}`);
      if (this.vertices.length <= 10) this.exibirColoracao(cor);
      return cor;
    });
  }

  // Método auxiliar recursivo para tentar colorir
  private tentarColorir(v: number, cor: number[], numCores: number): boolean {
    if (v == this.vertices.length) return true;

    for (let c = 1; c <= numCores; c++) {
      if (this.ehSeguro(v, cor, c)) {
        cor[v] = c;
        if (this.tentarColorir(v + 1, cor, numCores)) return true;
        cor[v] = -1;
      }
    }

    return false;
  }

  // Verifica se é seguro colorir o vértice v com a cor c
  private ehSeguro(v: number, cor: number[], c: number): boolean {
    const vizinhos = this.retornarVizinhos(v);
    for (let vizinho of vizinhos) {
      if (cor[vizinho] === c) return false;
    }
    return true;
  }

  welshPowell() {
    return this.calcularTempoExecucao(() => {
      const n = this.vertices.length;
      const grau = this.vertices.map((v, idx) => [
        idx,
        this.retornarVizinhos(idx).length,
      ]);
      grau.sort((a, b) => b[1] - a[1]);

      let cor = Array(n).fill(-1);
      let coresUsadas = 0;

      grau.forEach(([v]) => {
        let corDisponivel = Array(n).fill(true);

        const vizinhos = this.retornarVizinhos(v);
        for (let vizinho of vizinhos) {
          if (cor[vizinho] !== -1) corDisponivel[cor[vizinho]] = false;
        }

        for (let c = 1; c <= n; c++) {
          if (corDisponivel[c]) {
            cor[v] = c;
            coresUsadas = Math.max(coresUsadas, c);
            break;
          }
        }
      });

      console.log("Welsh-Powell");
      console.log(`Número de cores utilizadas: ${coresUsadas}`);
      if (this.vertices.length <= 10) this.exibirColoracao(cor);
      return cor;
    });
  }

  dsatur() {
    return this.calcularTempoExecucao(() => {
      const n = this.vertices.length;
      let cor = Array(n).fill(-1);
      let grauSaturacao = Array(n).fill(0);

      let grau = this.vertices.map((v, idx) => [
        idx,
        this.retornarVizinhos(idx).length,
      ]);
      grau.sort((a, b) => b[1] - a[1]);

      let coresUsadas = 0;

      while (grau.length > 0) {
        grau.sort((a, b) => {
          if (grauSaturacao[a[0]] === grauSaturacao[b[0]]) {
            return b[1] - a[1];
          }
          return grauSaturacao[b[0]] - grauSaturacao[a[0]];
        });

        const proximo = grau.shift();
        if (proximo) {
          let [v] = proximo;
          let corDisponivel = Array(n).fill(true);

          const vizinhos = this.retornarVizinhos(v);
          for (let vizinho of vizinhos) {
            if (cor[vizinho] !== -1) corDisponivel[cor[vizinho]] = false;
          }

          for (let c = 1; c <= n; c++) {
            if (corDisponivel[c]) {
              cor[v] = c;
              coresUsadas = Math.max(coresUsadas, c);
              break;
            }
          }

          for (let vizinho of vizinhos) {
            grauSaturacao[vizinho]++;
          }
        }
      }

      console.log("DSatur");
      console.log(`Número de cores utilizadas: ${coresUsadas}`);
      if (this.vertices.length <= 10) this.exibirColoracao(cor);
      return cor;
    });
  }

  private exibirColoracao(cor: number[]) {
    console.log("Coloração dos vértices:");
    cor.forEach((c, v) => {
      console.log(`Vértice ${v}: Cor ${c}`);
    });
  }
  heuristicaSimples() {
    return this.calcularTempoExecucao(() => {
      const n = this.vertices.length;
      let cor = Array(n).fill(-1);
      let coresUsadas = 0;

      for (let v = 0; v < n; v++) {
        let corDisponivel = Array(n).fill(true);

        const vizinhos = this.retornarVizinhos(v);
        for (let vizinho of vizinhos) {
          if (cor[vizinho] !== -1) corDisponivel[cor[vizinho]] = false;
        }

        for (let c = 1; c <= n; c++) {
          if (corDisponivel[c]) {
            cor[v] = c;
            coresUsadas = Math.max(coresUsadas, c);
            break;
          }
        }
      }

      console.log("Heurística Simples");
      console.log(`Número de cores utilizadas: ${coresUsadas}`);
      if (this.vertices.length <= 10) this.exibirColoracao(cor);
      return cor;
    });
  }

  abstract exportarParaJSON(): { nodes: any[]; edges: any[] };
}

export default Grafo;
