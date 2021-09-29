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
    async createMember(creator, userId, username, discriminator, ign, role = "nd", profession = "nd") {
        const member = new Member({
            createdBy: creator,
            userId: userId,
            username: username,
            discriminator: discriminator,
            ign: ign,
            role: role,
            profession: profession
        });

        try {
            const response = await member.save()
            console.log(response)
            return { status: "success" , data: response };
        }   
        catch (err) {
            console.log(err.message)
            let response = { status: "error", msg: err.message };
            return response;
        }     
        
    },
    async updateMember(userId, member) {
        try {
            const update = ({
                username: member.username,
                discriminator: member.discriminator,
                role: member.role,
                profession: member.profession,
                comments: member.comments,
                lastUpdated: Date.now(),
                lastUpdatedBy: member.lastUpdatedBy
            });

            const response = await Member.findOneAndUpdate({ userId }, update);
            console.log(response);
            return { status: "success" , data: response };
        }
        catch (err) {
            console.log(err.message)
            let response = { status: "error", msg: err.message };
            return response;
        }
    },
    async deleteMember(userId) {
        try {
            const response = await Member.findOneAndDelete({ userId });
            return { status: "success" , data: response };
        }
        catch (err) {
            console.log(err.message)
            let response = { status: "error", msg: err.message };
            return response;
        }
    },
    async fetchMembers() {
        try {
            // Fetch from db sorting by descending role
            const response = await Member.find().sort({ role: -1 });
            
            return { status: "success" , data: response };
        }
        catch (err) {
            console.log(err.message)

            let response = { status: "error", msg: err.message };
            return response;
        };

    },

}