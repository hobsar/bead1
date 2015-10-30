//Viewmodel réteg
var statusTexts = {
    'new': 'Új',
    'assigned': 'Módosítva',
    'ready': 'Kész',
    'rejected': 'Elutasítva',
    'pending': 'Felfüggesztve',
};
var statusClasses = {
    'new': 'danger',
    'assigned': 'info',
    'ready': 'success',
    'rejected': 'default',
    'pending': 'warning',
};

function decorateReceptek(userid,receptContainer) {
    return receptContainer.map(function (e) {
        e.statusText = statusTexts[e.status];
        e.statusClass = statusClasses[e.status];
        e.change = e.feltolto == userid;
        return e;
    });
}

module.exports = decorateReceptek;