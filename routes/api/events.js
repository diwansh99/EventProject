/**
 * Created by championswimmer on 15/06/17.
 */
const route = require('express').Router();
const authUtils = require('../../auth/utils');
const Event = require('../../db/models').Event;
const User = require('../../db/models').User;
const EventInvitee = require('../../db/models').EventInvitee;
const Invitee = require('../../db/models').Invitee;

const im = require('../../utils/inviteemailer');

route.get('/', (req, res) => {
    console.log(req.user);
    Event.findAll({
        attributes: ['id', 'title', 'startTime', 'endTime', 'venue', 'hostId'],
    })
        .then((events) => {
            res.status(200).send(events)
        })
        .catch((err) => {
            console.log(err)
            res.status(500).send("Error retrieving events")
        })
});


route.get('/:id', (req, res) => {
    Event.findOne({
        where: {
            id: req.params.id
        },
        include: [{
            model: User,
            as: 'host',
            attributes: ['username', 'email']
        }]
    })
        .then((event) => {
            if (!event) {
                return res.status(500).send("No such event found")
            }
            res.status(200).send(event);
        })
        .catch((err) => {
            res.status(500).send('Error finding event')
        })
});



route.post('/new', (req, res) => {
    //Add server-side validations if required here
    if (!req.body.title) {
        return res.status(403).send('Event cannot created without title')
    }

    // YYYY-MM-DD'T'HH:MM
    Event.create({
        title: req.body.title,
        venue: req.body.venue,
        imgUrl: req.body.imgUrl,
        startTime: new Date(req.body.startTime),
        endTime: new Date(req.body.endTime),
        message: req.body.message,
        hostId: req.user.id
    }).then((event) => {
        //res.status(200).send(event)

        if (req.body.invitees) {
            let invitees = req.body.invitees.split(';');
            invitees = invitees.map((i) => {
                return {email: i.trim()}
            });
            Invitee.bulkCreate(invitees, {
                ignoreDuplicates: true
            })
                .then((invitees) => {
                    let eventInvitee = invitees.map((i) => {
                        return {
                            eventId: event.id,
                            inviteeId: i.id
                        }
                    });

                    EventInvitee.bulkCreate(eventInvitee, {
                        ignoreDuplicates: true
                    })
                        .then((eiArr) => {
                            res.status(200).send(event)
                            let emailArr = invitees.map((i) => i.email);
                            im.sendInvite(emailArr, function () {
                                console.log('Invites are sent');
                            });

                        })
                })
        } else {
            res.status(200).send(event)
        }
    }).catch((err) => {
        res.status(500).send("There was an error creating event")

    })
});

route.put('/:id', (req, res) => {
    Event.update({
            title: req.body.title,
            message: req.body.message,
            startTime: req.body.startTime ? new Date(req.body.startTime) : undefined,
            endTime: req.body.endTime ? new Date(req.body.endTime) : undefined,
            imgUrl: req.body.imgUrl,
            venue: req.body.venue,
        },
        {
            where: {
                id: req.params.id,
                hostId: req.user.id
            }
        }).then((updatedEvent) => {
            if (updatedEvent[0] == 0) {
                return res.status(403).send('Event does not exist, or you cannot edit it')
            } else {
                res.status(200).send('Event successfully edited')
            }

    })
});

route.delete('/:id', /*authUtils.eia(),*/ (req, res) => {
    Event.destroy(
        {
            where: {
                id: req.params.id,
                hostId: /*req.userIsAdmin ?*/ req.user.id //: undefined
            }
        }).then((destroyedRows) => {
        if (destroyedRows == 0) {
            return res.status(403).send('Event does not exist, or you cannot edit it')
        } else {
            res.status(200).send('Event successfully deleted')
        }

    })
});

// ============ INVITEE ENDPOINTS ==============
route.get('/:id/invitees', (req, res) => {
    EventInvitee.findAll({
        attributes: ['id'],
        where: {
            eventId: req.params.id,
            '$event.hostId$': req.user.id,
        },
        include: [{
            model: Invitee,
            as: 'invitee',
            attributes: ['id', 'email']
        }, {
            model: Event,
            as: 'event',
            attributes: ['id', 'hostId']
        }]
    }).then((invitees) => {
        if (invitees) {
            res.status(200).send(invitees)
        } else {
            res.status(500).send('No invitees found for this event')
        }
    })
});

route.put('/:id/invitees', (req, res) => {
    let invitees = req.body.invitees.split(';');
    invitees = invitees.map((i) => {
        return {email: i.trim()}
    });
    Invitee.bulkCreate(invitees, {
        ignoreDuplicates: true
    })
        .then((invitees) => {
            let eventInvitee = invitees.map((i) => {
                return {
                    eventId: req.params.id,
                    inviteeId: i.id
                }
            });

            EventInvitee.bulkCreate(eventInvitee, {
                ignoreDuplicates: true
            })
                .then((eiArr) => {
                    res.status(200).send({
                        newInvitees: eiArr
                    })
                })
        })
});

route.delete('/:id/invitees/:invId', (req, res) => {
    EventInvitee.destroy({
        where: {
            eventId: req.params.id,
            inviteeId: req.params.invId
        }
    }).then((result) => {
        if (result == 0) {
            return res.status(500).send({error: 'Invitee or Event did not exist'})
        } else {
            return res.status(200).send({success: true})
        }
    })
});

module.exports = route;