const mongoose = require('mongoose');
const fs = require('fs');
const logger = require('../logger');

// Mongoose Models
const Member = require('./models/member');
const { findOneAndUpdate } = require('./models/member');
const { assert } = require('console');

module.exports = {
    data: { client: null, Discord: null, config: null },
        

    async initialize(client, Discord, config) {
        this.data.client = client;
        this.data.Discord = Discord;
        this.data.config = config;
    },

    async connect() {
        // const connection = await mongoose.connect(`mongodb://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOSTPORT}/${process.env.DB_NAME}?${process.env.DB_OPTS}`);
        console.log("Database: Trying to connect.");
        const connection = await mongoose.connect(`mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOSTPORT}/${process.env.DB_NAME}?${process.env.DB_OPTS}`);        
        return connection;
    },
    async createMember(creator, userId, username, discriminator, role = null, profession = null, comments = null) {
        const member = new Member({
            createdBy: creator,
            userId: userId,
            username: username,
            discriminator: discriminator,
            role: role,
            profession: profession,
            comments: comments
        });

        try {
            const response = await member.save()
            console.log(response)
            return response;
        }   
        catch (err) {
            console.log(err.message)
            return { status: 0, msg: err.message };
        }     
        
    },
    async updateMember(userId, member) {
        try {
            const update = new Member ({
                username: member.username,
                discriminator: member.discriminator,
                role: member.role,
                profession: member.profession,
                comments: member.comments,
                lastUpdated: Date.now(),
                lastUpdatedBy: member.lastUpdatedBy
            });

            const response = Member.findOneAndUpdate({ userId }, update);
            return response;
        }
        catch (err) {
            console.log(err.message)
            return { status: 0, msg: err.message };
        }
    },
    async deleteMember(userId) {
        try {
            const response = Member.findOneAndDelete({ userId });
            return response;
        }
        catch (err) {
            console.log(err.message)
            return { status: 0, msg: err.message };
        }
    },
    async fetchMembers() {
        try {
            const response = await Member.find();
            
            return response;
        }
        catch (err) {
            console.log(err.message)
            return { status: 0, msg: err.message };
        };

    },

}