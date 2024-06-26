// Quando o conteúdo do documento estiver totalmente carregado e analisado,
// chama a função fetchDataAndInitialize para buscar os dados e inicializar a aplicação.
document.addEventListener("DOMContentLoaded", function () {
  fetchDataAndInitialize();
});

// Função responsável por buscar os dados do arquivo JSON e inicializar a aplicação
function fetchDataAndInitialize() {
  fetch("data/empresas.json")
    .then((response) => response.json())
    .then((data) => {
      initialize(data);
    })
    .catch((error) => console.error("Erro ao carregar empresas:", error));
}

// Função que inicializa a aplicação com os dados carregados
function initialize(data) {
  displayCompanies(data);
  setupSearch(data);
  setupFilters(data);
  populateFilterOptions(data);

  // Adiciona um listener para o botão de resetar filtros
  document
    .getElementById("reset-button")
    .addEventListener("click", () => resetFilters(data));

  // Adiciona listeners para atualizar a lista de empresas conforme os filtros são modificados
  const filters = [
    document.getElementById("caixa-busca"),
    document.getElementById("setor-filtro"),
    document.getElementById("subsetor-filtro"),
    document.getElementById("segmento-filtro"),
    document.getElementById("filtro-divulga"),
    document.getElementById("filtro-matriz"),
    document.getElementById("filtro-ods"),
    document.getElementById("filtro-tcfd"),
    document.getElementById("filtro-inventario"),
  ];

  filters.forEach((filter) => {
    filter.addEventListener("input", () => filterCompanies(data));
    filter.addEventListener("change", () => filterCompanies(data));
  });
}

// Função que exibe a lista de empresas na página
function displayCompanies(companies) {
  const listElement = document.getElementById("lista-empresas");
  listElement.innerHTML = ""; // Limpa a lista existente

  companies.forEach((company) => {
    const companyDiv = document.createElement("div");
    companyDiv.className = "company-info"; // Classe para estilização
    companyDiv.innerHTML = `
        <h3>${company.razao_social}</h3>
        <div class="company-details">
            <p><strong>Setor:</strong> ${company.setor}</p>
            <p><strong>Subsetor:</strong> ${company.subsetor}</p>
            <p><strong>Segmento:</strong> ${company.segmento}</p></div>
            <div class="company-boolean">
            ${
              company.divulga_relatorio
                ? '<p class="badge"><i class="fa-solid fa-file-signature" aria-label="Documento"></i> Divulga Relatório</p>'
                : ""
            }
            ${
              company.matriz_materialidade
                ? '<p class="badge"><i class="fa-solid fa-table-cells-large" aria-label="Tabela"></i> Matriz de Materialidade</p>'
                : ""
            }
            ${
              company.ods
                ? '<p class="badge"><i class="fa-solid fa-earth-americas" aria-label="Globo"></i> Considera os ODS</p>'
                : ""
            }
            ${
              company.tcfd
                ? '<p class="badge"><i class="fa-solid fa-chart-line" aria-label="Gráfico de linha"></i> Adere ao TCFD</p>'
                : ""
            }
            ${
              company.inventario_gee
                ? '<p class="badge"><i class="fa-solid fa-temperature-arrow-up" aria-label="Temperatura alta"></i> Realiza Inventário de GEE</p>'
                : ""
            }</div>
        </div>
    `;
    listElement.appendChild(companyDiv);
  });

  // Atualiza o total de resultados exibidos
  document.getElementById(
    "total-resultados"
  ).textContent = `${companies.length} empresas encontradas`;
}

// Função que configura a funcionalidade de busca por razão social das empresas
function setupSearch(companies) {
  const searchBox = document.getElementById("caixa-busca");
  searchBox.addEventListener("input", () => {
    const searchText = searchBox.value.toLowerCase();
    const filteredCompanies = companies.filter((company) =>
      company.razao_social.toLowerCase().includes(searchText)
    );
    displayCompanies(filteredCompanies); // Atualiza a lista com as empresas filtradas
  });
}

// Função que configura os filtros de seleção e booleanos para filtrar a lista de empresas
function setupFilters(companies) {
  const sectorFilter = document.getElementById("setor-filtro");
  const subsectorFilter = document.getElementById("subsetor-filtro");
  const segmentFilter = document.getElementById("segmento-filtro");
  const booleanFilters = [
    "filtro-divulga",
    "filtro-matriz",
    "filtro-ods",
    "filtro-tcfd",
    "filtro-inventario",
  ];

  // Adiciona um listener para o filtro de setor
  sectorFilter.addEventListener("change", () => {
    filterCompanies(companies);
    populateFilterOptions(companies, { sector: sectorFilter.value });
  });

  // Adiciona um listener para o filtro de subsetor
  subsectorFilter.addEventListener("change", () => {
    filterCompanies(companies);
    populateFilterOptions(companies, {
      sector: sectorFilter.value,
      subsector: subsectorFilter.value,
    });
  });

  // Adiciona um listener para o filtro de segmento
  segmentFilter.addEventListener("change", () => {
    filterCompanies(companies);
  });

  // Adiciona listeners para os filtros booleanos
  booleanFilters.forEach((id) => {
    document.getElementById(id).addEventListener("change", () => {
      filterCompanies(companies);
      populateFilterOptions(companies);
    });
  });
}

// Função que filtra a lista de empresas com base nos critérios selecionados
function filterCompanies(companies) {
  const searchText = document.getElementById("caixa-busca").value.toLowerCase();
  const sector = document.getElementById("setor-filtro").value;
  const subsector = document.getElementById("subsetor-filtro").value;
  const segment = document.getElementById("segmento-filtro").value;

  // Filtra as empresas com base nos critérios de busca e seleção
  const filteredCompanies = companies.filter((company) => {
    return (
      (searchText === "" ||
        company.razao_social.toLowerCase().includes(searchText)) &&
      (sector === "" || company.setor === sector) &&
      (subsector === "" || company.subsetor === subsector) &&
      (segment === "" || company.segmento === segment) &&
      (document.getElementById("filtro-divulga").checked
        ? company.divulga_relatorio === true
        : true) &&
      (document.getElementById("filtro-matriz").checked
        ? company.matriz_materialidade === true
        : true) &&
      (document.getElementById("filtro-ods").checked
        ? company.ods === true
        : true) &&
      (document.getElementById("filtro-tcfd").checked
        ? company.tcfd === true
        : true) &&
      (document.getElementById("filtro-inventario").checked
        ? company.inventario_gee === true
        : true)
    );
  });

  // Exibe as empresas filtradas
  displayCompanies(filteredCompanies);
  // Verifica se há algum filtro aplicado e atualiza a visibilidade do botão de reset
  checkFilters();
}

// Função que popula as opções dos filtros de seleção com base nos dados das empresas e nos filtros aplicados
function populateFilterOptions(companies, filterBy = {}) {
  const sectors = new Set();
  const subsectors = new Set();
  const segments = new Set();

  // Função auxiliar para aplicar filtros booleanos
  const filterBoolean = (company) => {
    return (
      (!document.getElementById("filtro-divulga").checked ||
        company.divulga_relatorio === true) &&
      (!document.getElementById("filtro-matriz").checked ||
        company.matriz_materialidade === true) &&
      (!document.getElementById("filtro-ods").checked ||
        company.ods === true) &&
      (!document.getElementById("filtro-tcfd").checked ||
        company.tcfd === true) &&
      (!document.getElementById("filtro-inventario").checked ||
        company.inventario_gee === true)
    );
  };

  // Itera sobre cada empresa e adiciona os setores, subsetores e segmentos aos conjuntos
  companies.forEach((company) => {
    if (
      filterBoolean(company) &&
      (!filterBy.sector || company.setor === filterBy.sector)
    ) {
      sectors.add(company.setor);
      if (!filterBy.subsector || company.subsetor === filterBy.subsector) {
        subsectors.add(company.subsetor);
        if (!filterBy.segment || company.segmento === filterBy.segment) {
          segments.add(company.segmento);
        }
      }
    }
  });

  // Popula os filtros de seleção com as opções disponíveis
  if (!filterBy.sector)
    populateSelect(document.getElementById("setor-filtro"), sectors);
  if (!filterBy.subsector)
    populateSelect(document.getElementById("subsetor-filtro"), subsectors);
  if (!filterBy.segment)
    populateSelect(document.getElementById("segmento-filtro"), segments);
}

// Função que popula um elemento de seleção (select) com um conjunto de opções
function populateSelect(selectElement, options) {
  const currentValue = selectElement.value;

  // Mantém a opção inicial existente
  const initialOption = selectElement.querySelector('option[value=""]');
  selectElement.innerHTML = ""; // Limpa todas as opções

  if (initialOption) {
    selectElement.appendChild(initialOption); // Re-adiciona a opção inicial
  }

  // Adiciona cada opção ao elemento de seleção
  options.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option;
    optionElement.textContent = option;
    optionElement.selected = option === currentValue;
    selectElement.appendChild(optionElement);
  });
}

// Função que reseta todos os filtros e exibe novamente todas as empresas
function resetFilters(companies) {
  // Limpa os campos de texto e as seleções dos filtros
  document.getElementById("caixa-busca").value = "";
  document.getElementById("setor-filtro").value = "";
  document.getElementById("subsetor-filtro").value = "";
  document.getElementById("segmento-filtro").value = "";
  document
    .querySelectorAll("input[type=checkbox]")
    .forEach((checkbox) => (checkbox.checked = false));

  // Repopula os filtros de seleção com as opções disponíveis
  populateFilterOptions(companies);
  // Exibe novamente todas as empresas
  displayCompanies(companies);

  // Esconde o botão de resetar busca
  document.getElementById("reset-button").style.display = "none";
}

// Função que verifica se algum filtro está ativo e atualiza a visibilidade do botão de reset
function checkFilters() {
  const searchBox = document.getElementById("caixa-busca").value;
  const setorFiltro = document.getElementById("setor-filtro").value;
  const subsetorFiltro = document.getElementById("subsetor-filtro").value;
  const segmentoFiltro = document.getElementById("segmento-filtro").value;
  const divulga = document.getElementById("filtro-divulga").checked;
  const matriz = document.getElementById("filtro-matriz").checked;
  const ods = document.getElementById("filtro-ods").checked;
  const tcfd = document.getElementById("filtro-tcfd").checked;
  const inventario = document.getElementById("filtro-inventario").checked;
  const resetButton = document.getElementById("reset-button");

  // Verifica se algum filtro está ativo
  if (
    searchBox ||
    setorFiltro ||
    subsetorFiltro ||
    segmentoFiltro ||
    divulga ||
    matriz ||
    ods ||
    tcfd ||
    inventario
  ) {
    resetButton.style.display = "block";
    resetButton.setAttribute("aria-hidden", "false");
  } else {
    resetButton.style.display = "none";
    resetButton.setAttribute("aria-hidden", "true");
  }
}
