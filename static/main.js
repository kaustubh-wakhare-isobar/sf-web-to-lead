const URL_PARAMS = new URLSearchParams(window.location.search);
const TOKEN = URL_PARAMS.get('token');
const RecordId = URL_PARAMS.get('id');

// Show an element
const show = (selector) => {
  document.querySelector(selector).style.display = 'block';
};

// Hide an element
const hide = (selector) => {
  document.querySelector(selector).style.display = 'none';
};

const recIdShow = (selector) => {
  document.querySelector(selector).innerHTML = RecordId;
};

if (TOKEN) {
  hide('.content.unauthorized');
  show('.content.authorized');
}
if (RecordId) {
  show('.content.success');
  hide('.content.authorized');
  hide('.content.unauthorized');
  recIdShow('#recordId');
}
