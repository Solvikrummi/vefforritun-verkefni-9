import { getLaunch, searchLaunches } from './api.js';
import { el } from './elements.js';

/**
 * Býr til leitarform.
 * @param {(e: SubmitEvent) => void} searchHandler Fall sem keyrt er þegar leitað er.
 * @param {string | undefined} query Leitarstrengur.
 * @returns {HTMLElement} Leitarform.
 */
export function renderSearchForm(searchHandler, query = undefined) {
  const form = el(
    'form',
    {},
    el('input', { value: query ?? '', name: 'query' }),
    el('button', {}, 'Leita')
  );

  form.addEventListener('submit', searchHandler);

  return form;
}

/**
 * Setur „loading state“ skilabað meðan gögn eru sótt.
 * @param {HTMLElement} parentElement Element sem á að birta skilbaoð í.
 * @param {Element | undefined} searchForm Leitarform sem á að gera óvirkt.
 */
function setLoading(parentElement, searchForm = undefined) {
  let loadingElement = parentElement.querySelector('.loading');

  if (!loadingElement) {
    loadingElement = el('div', { class: 'loading' }, 'Sæki gögn...');
    parentElement.appendChild(loadingElement);
  }

  if (!searchForm) {
    return;
  }

  const button = searchForm.querySelector('button');

  if (button) {
    button.setAttribute('disabled', 'disabled');
  }
}

/**
 * Fjarlægir „loading state“.
 * @param {HTMLElement} parentElement Element sem inniheldur skilaboð.
 * @param {Element | undefined} searchForm Leitarform sem á að gera virkt.
 */
function setNotLoading(parentElement, searchForm = undefined) {
  const loadingElement = parentElement.querySelector('.loading');

  if (loadingElement) {
    loadingElement.remove();
  }

  if (!searchForm) {
    return;
  }

  const disabledButton = searchForm.querySelector('button[disabled]');

  if (disabledButton) {
    disabledButton.removeAttribute('disabled');
  }
}

/**
 * Birta niðurstöður úr leit.
 * @param {import('./api.types.js').Launch[] | null} results Niðurstöður úr leit
 * @param {string} query Leitarstrengur.
 */
function createSearchResults(results, query) {
  const list = el('ul', { class: 'results' });

  if (!results) {
    const noResultsElement = el('li', {}, `Villa við leit að ${query}`);
    list.appendChild(noResultsElement);
    return list;
  }

  if (results.length === 0) {
    const noResultsElement = el(
      'li',
      {},
      `Engar niðurstöður fyrir leit að ${query}`
    );
    list.appendChild(noResultsElement);
    return list;
  }

  for (const result of results) {
    const resultElement = el(
      'li',
      { class: 'result' },
      el('span', { class: 'name' }, result.name),
      el('span', { class: 'mission' }, result.mission)
    );

    list.appendChild(resultElement);
  }

  return list;
}

/**
 *
 * @param {HTMLElement} parentElement Element sem á að birta niðurstöður í.
 * @param {Element} searchForm Form sem á að gera óvirkt.
 * @param {string} query Leitarstrengur.
 */
export async function searchAndRender(parentElement, searchForm, query) {
  const mainElement = parentElement.querySelector('main');

  if (!mainElement) {
    console.warn('fann ekki <main> element');
    return;
  }

  // Fjarlægja fyrri niðurstöður
  const resultsElement = mainElement.querySelector('.results');
  if (resultsElement) {
    resultsElement.remove();
  }

  setLoading(mainElement, searchForm);
  const results = await searchLaunches(query);
  setNotLoading(mainElement, searchForm);

  const resultsEl = createSearchResults(results, query, parentElement);

  mainElement.appendChild(resultsEl);
}

/**
 * Sýna forsíðu, hugsanlega með leitarniðurstöðum.
 * @param {HTMLElement} parentElement Element sem á að innihalda forsíðu.
 * @param {(e: SubmitEvent) => void} searchHandler Fall sem keyrt er þegar leitað er.
 * @param {string | undefined} query Leitarorð, ef eitthvað, til að sýna niðurstöður fyrir.
 */
export function renderFrontpage(
  parentElement,
  searchHandler,
  query = undefined
) {
  const heading = el(
    'h1',
    { class: 'heading', 'data-foo': 'bar' },
    'Geimskotaleitin 🚀'
  );
  const searchForm = renderSearchForm(searchHandler, query);

  const container = el('main', {}, heading, searchForm);
  parentElement.appendChild(container);

  if (!query) {
    return;
  }

  searchAndRender(parentElement, searchForm, query);
}

/**
 * Sýna geimskot.
 * @param {HTMLElement} parentElement Element sem á að innihalda geimskot.
 * @param {string} id Auðkenni geimskots.
 */
export async function renderDetails(parentElement, id) {
  const container = el('main', {});
  const backElement = el(
    'div',
    { class: 'back' },
    el('a', { href: '/' }, 'Til baka')
  );

  parentElement.appendChild(container);
  container.appendChild(backElement);

  // Setja loading state á meðan gögn eru sótt
  setLoading(container);

  const result = await getLaunch(id);

  // Fjarlægja loading state
  setNotLoading(container);

  if (!result) {
    const errorElement = el('p', {}, 'Villa við að sækja upplýsingar um geimskot.');
    container.appendChild(errorElement);
    return;
  }

  // Birta gögn um geimskot
  const detailsElement = el(
    'div',
    { class: 'launch-details' },
    el('h2', {}, result.name),
    el('p', {}, result.details),
    // Bæta við fleiri upplýsingum eftir þörfum
  );

  container.appendChild(detailsElement);
  /**
  * Birta niðurstöður úr leit.
  * @param {import('./api.types.js').Launch[] | null} results Niðurstöður úr leit
  * @param {string} query Leitarstrengur.
  * @param {HTMLElement} parentElement Element sem á að birta niðurstöður í.
  */
  function createSearchResults(results, query, parentElement) {
    const list = el('ul', { class: 'results' });

    if (!results) {
      const noResultsElement = el('li', {}, `Villa við leit að ${query}`);
      list.appendChild(noResultsElement);
      return list;
    }

    if (results.length === 0) {
      const noResultsElement = el(
        'li',
        {},
        `Engar niðurstöður fyrir leit að ${query}`
      );
      list.appendChild(noResultsElement);
      return list;
    }

    for (const result of results) {
      const articleElement = el(
        'li',
        { class: 'article' },
        el('h3', {}, result.title), // Assuming each result has a title
        el('p', {}, result.summary), // Assuming each result has a summary
        // Add more details about the article here
      );

      list.appendChild(articleElement);
    }

    return list;
  }


}
