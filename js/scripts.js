fetch("data/empresas.json")
  .then((response) => response.json())
  .then((data) => {
    console.log(data); // Aqui você tem os dados das empresas
    // Aqui você pode chamar funções para manipular e exibir os dados no seu site
  })
  .catch((error) => console.error("Falha ao carregar os dados:", error));

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
                ? '<p class="badge"><i class="fa-solid fa-file-signature"></i> Divulga Relatório</p>'
                : ""
            }
            ${
              company.matriz_materialidade
                ? '<p class="badge"><i class="fa-solid fa-table-cells-large"></i> Matriz de Materialidade</p>'
                : ""
            }
            ${
              company.ods
                ? '<p class="badge"><i class="fa-solid fa-earth-americas"></i> Considera os ODS</p>'
                : ""
            }
            ${
              company.tcfd
                ? '<p class="badge"><i class="fa-solid fa-chart-line"></i> Adere ao TCFD</p>'
                : ""
            }
            ${
              company.inventario_gee
                ? '<p class="badge"><i class="fa-solid fa-temperature-arrow-up"></i> Realiza Inventário de GEE</p>'
                : ""
            }</div>
        </div>
    `;
    listElement.appendChild(companyDiv);
  });

  // Atualizar o total de resultados
  document.getElementById(
    "total-resultados"
  ).textContent = `${companies.length} empresas encontradas`;
}

document.addEventListener("DOMContentLoaded", function () {
  fetch("data/empresas.json")
    .then((response) => response.json())
    .then((data) => {
      displayCompanies(data); // Exibe todas as empresas assim que os dados são carregados
    })
    .catch((error) => console.error("Erro ao carregar empresas:", error));
});

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

document.addEventListener("DOMContentLoaded", function () {
  fetch("data/empresas.json")
    .then((response) => response.json())
    .then((data) => {
      displayCompanies(data); // Exibe todas as empresas inicialmente
      setupSearch(data); // Configura a funcionalidade de busca
    })
    .catch((error) => console.error("Erro ao carregar empresas:", error));
});

function populateFilterOptions(companies, filterBy = {}) {
  const sectors = new Set();
  const subsectors = new Set();
  const segments = new Set();

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

  if (!filterBy.sector)
    populateSelect(document.getElementById("setor-filtro"), sectors);
  if (!filterBy.subsector)
    populateSelect(document.getElementById("subsetor-filtro"), subsectors);
  if (!filterBy.segment)
    populateSelect(document.getElementById("segmento-filtro"), segments);
}

function populateSelect(selectElement, options) {
  const currentValue = selectElement.value;
  // Mantém a opção inicial existente
  const initialOption = selectElement.querySelector('option[value=""]');
  selectElement.innerHTML = ""; // Limpa todas as opções
  if (initialOption) {
    selectElement.appendChild(initialOption); // Re-adiciona a opção inicial
  }
  options.forEach((option) => {
    const optionElement = document.createElement("option");
    optionElement.value = option;
    optionElement.textContent = option;
    optionElement.selected = option === currentValue;
    selectElement.appendChild(optionElement);
  });
}

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

  sectorFilter.addEventListener("change", () => {
    filterCompanies(companies);
    populateFilterOptions(companies, { sector: sectorFilter.value });
  });

  subsectorFilter.addEventListener("change", () => {
    filterCompanies(companies);
    populateFilterOptions(companies, {
      sector: sectorFilter.value,
      subsector: subsectorFilter.value,
    });
  });

  segmentFilter.addEventListener("change", () => {
    filterCompanies(companies);
  });

  booleanFilters.forEach((id) => {
    document.getElementById(id).addEventListener("change", () => {
      filterCompanies(companies);
      populateFilterOptions(companies);
    });
  });

  document
    .getElementById("caixa-busca")
    .addEventListener("input", () => filterCompanies(companies));
}

function filterCompanies(companies) {
  const searchText = document.getElementById("caixa-busca").value.toLowerCase();
  const sector = document.getElementById("setor-filtro").value;
  const subsector = document.getElementById("subsetor-filtro").value;
  const segment = document.getElementById("segmento-filtro").value;

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

  displayCompanies(filteredCompanies);
}

document.addEventListener("DOMContentLoaded", function () {
  fetch("data/empresas.json")
    .then((response) => response.json())
    .then((data) => {
      displayCompanies(data);
      setupSearch(data);
      populateFilterOptions(data);
      setupFilters(data);
    })
    .catch((error) => console.error("Erro ao carregar empresas:", error));
});

function resetFilters(companies) {
  // Limpar campos de texto e caixas de seleção
  document.getElementById("caixa-busca").value = "";
  document.getElementById("setor-filtro").value = "";
  document.getElementById("subsetor-filtro").value = "";
  document.getElementById("segmento-filtro").value = "";
  document
    .querySelectorAll("input[type=checkbox]")
    .forEach((checkbox) => (checkbox.checked = false));

  // Repopular os filtros e redisplay todas as empresas
  populateFilterOptions(companies);
  displayCompanies(companies);

  // Esconder o botão de resetar busca
  document.getElementById("reset-button").style.display = "none";
}

document.addEventListener("DOMContentLoaded", function () {
  fetch("data/empresas.json")
    .then((response) => response.json())
    .then((data) => {
      displayCompanies(data);
      populateFilterOptions(data);
      setupFilters(data);

      // Listener para o botão de reset
      document
        .getElementById("reset-button")
        .addEventListener("click", () => resetFilters(data));
    })
    .catch((error) => console.error("Erro ao carregar empresas:", error));
});

document.addEventListener("DOMContentLoaded", function () {
  fetch("data/empresas.json")
    .then((response) => response.json())
    .then((data) => {
      displayCompanies(data);
      populateFilterOptions(data);
      setupFilters(data);

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
        filter.addEventListener("input", checkFilters);
        filter.addEventListener("change", checkFilters);
      });

      document
        .getElementById("reset-button")
        .addEventListener("click", () => resetFilters(data));
    })
    .catch((error) => console.error("Erro ao carregar empresas:", error));
});

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
  } else {
    resetButton.style.display = "none";
  }
}
