const STORAGE_KEY = 'folio_simple_notes';

const defaultNotes = [
  {
    id: 1,
    subject: 'CS 201',
    title: 'Binary Search Trees',
    date: 'Nov 18, 2026',
    body: 'Every left child is smaller than its parent, and every right child is larger. Average search time is O(log n).',
  },
  {
    id: 2,
    subject: 'MATH 240',
    title: 'Eigenvalues & Eigenvectors',
    date: 'Nov 16, 2026',
    body: 'Solve det(A - lambda * I) = 0 to find eigenvalues, then find null(A - lambda * I) for eigenvectors.',
  },
  {
    id: 3,
    subject: 'PHYS 112',
    title: 'Angular Momentum',
    date: 'Nov 14, 2026',
    body: 'Angular momentum L = I * omega stays constant when net external torque is zero.',
  },
];

let notes = [];
let activeSubject = 'ALL';
let searchText = '';

async function initNotes() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    notes = JSON.parse(saved);
  } else {
    try {
      const response = await fetch('./json/notes.json');
      notes = response.ok ? await response.json() : defaultNotes;
    } catch {
      notes = defaultNotes;
    }
  }
  renderNotes();
}

const pages = {
  home: document.getElementById('page-home'),
  notes: document.getElementById('page-notes'),
  about: document.getElementById('page-about'),
};

const navLinks = document.querySelectorAll('.nav-link');
const form = document.getElementById('note-form');
const subjectInput = document.getElementById('subject-input');
const titleInput = document.getElementById('title-input');
const bodyInput = document.getElementById('body-input');
const searchInput = document.getElementById('search-input');
const notesList = document.getElementById('notes-list');
const filterButtons = document.querySelectorAll('.filter-btn');

// Switch between Home, Notes, and About pages
function showPage(pageName) {
  const target = pages[pageName] ? pageName : 'home';

  Object.keys(pages).forEach((name) => {
    pages[name].hidden = name !== target;
  });

  navLinks.forEach((link) => {
    link.classList.toggle('active', link.dataset.page === target);
  });

  window.scrollTo(0, 0);
}

function syncPageFromHash() {
  const pageName = window.location.hash.replace('#', '') || 'home';
  showPage(pageName);
}

document.querySelectorAll('[data-page]').forEach((link) => {
  link.addEventListener('click', (event) => {
    event.preventDefault();
    const pageName = link.dataset.page;
    window.location.hash = pageName;
    showPage(pageName);
  });
});

window.addEventListener('hashchange', syncPageFromHash);

function saveNotes() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(notes));
}

function renderNotes() {
  const query = searchText.trim().toLowerCase();

  const filtered = notes.filter((note) => {
    const matchesSubject = activeSubject === 'ALL' || note.subject === activeSubject;
    const matchesQuery =
      !query ||
      note.title.toLowerCase().includes(query) ||
      note.body.toLowerCase().includes(query) ||
      note.subject.toLowerCase().includes(query);
    return matchesSubject && matchesQuery;
  });

  notesList.innerHTML = '';

  if (filtered.length === 0) {
    notesList.innerHTML = '<p class="empty-message">No notes found.</p>';
    return;
  }

  filtered.forEach((note) => {
    const card = document.createElement('article');
    card.className = 'note-card';

    card.innerHTML = `
      <div class="note-header">
        <div>
          <h3 class="note-title"></h3>
          <p class="note-meta"></p>
        </div>
        <button type="button" class="delete-btn">Delete</button>
      </div>
      <p class="note-body"></p>
    `;

    card.querySelector('.note-title').textContent = note.title;
    card.querySelector('.note-meta').textContent = `${note.subject} · ${note.date}`;
    card.querySelector('.note-body').textContent = note.body;

    card.querySelector('.delete-btn').addEventListener('click', () => {
      notes = notes.filter((item) => item.id !== note.id);
      saveNotes();
      renderNotes();
    });

    notesList.appendChild(card);
  });
}

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const newNote = {
    id: Date.now(),
    subject: subjectInput.value,
    title: titleInput.value.trim(),
    date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    body: bodyInput.value.trim(),
  };

  notes.unshift(newNote);
  saveNotes();
  form.reset();
  renderNotes();
});

filterButtons.forEach((button) => {
  button.addEventListener('click', () => {
    activeSubject = button.dataset.subject;
    filterButtons.forEach((btn) => btn.classList.remove('active'));
    button.classList.add('active');
    renderNotes();
  });
});

searchInput.addEventListener('input', (event) => {
  searchText = event.target.value;
  renderNotes();
});

syncPageFromHash();
initNotes();
