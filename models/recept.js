module.exports = {
    identity: 'recept',
    connection: 'default',
    attributes: {
       /* date: {
            type: 'datetime',
            defaultsTo: function () { return new Date(); },
            required: true,
        },*/
        knev: {
            type: 'string',
            required: true,
        },
        status: {
            type: 'string',
            enum: ['new', 'assigned', 'success', 'rejected', 'pending'],
            required: true,
        },
        kategoria: {
            type: 'string',
            required: true,
        },
        description: {
            type: 'string',
            required: true,
        },

        user: {
            model: 'user',
        },
    }
}