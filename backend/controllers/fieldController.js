const Field = require('../models/Field');
const User = require('../models/User');
const UpdatesRecorder = require('../models/updatesRecorder');
const logger = require('../utils/logger');

//create a field
const createField = async(req, res, next)=>{
    const {Name, cropType, plantingDate, currentStage, fieldAgent, notes, fieldStage, fieldStatus} = req.body;
    try {
        if(req.user.role.toLowerCase() !== 'admin'){
            logger.warn(`Unauthorized field creation attempt by user ${req.user.email}`);
            return res.status(403).json("This action is forbidden.");
        }
        const field = await Field.create({
            Name,
            cropType,
            plantingDate,
            currentStage,
            fieldAgent: null, // field agent will be assigned later,
            notes: null, // notes to be added later by agent
            fieldStatus: null // field status to be updated later by agent
        }
        )
        logger.info(`Field created by admin ${req.user.email}`);
        res.status(201).json("Field created successfully");
    } catch (error) {
        logger.error({message: error.message,
             stack: error.stack.split("\n")[0]
        });
        next(error);
    }
}

//  assigning a field agent to a field
const assignFieldAgent = async(req, res, next)=>{
    // assign using email
    const {email} = req.body;
    try {
        const fieldId = req.params.id;
        if(req.user.role.toLowerCase() !== 'admin'){
            logger.warn(`Unauthorized field agent assignment attempt by user ${req.user.email}`);
            return res.status(403).json("This action is forbidden.")
        }
        const fieldAgent = await User.findOne({ email });
        if(!fieldAgent){
            return res.status(400).json("Field agent not found");
        }
        if(fieldAgent.role.toLowerCase() !== 'field agent' ){
            return res.status(400).json("User is not a field agent");
        }
        const field = await Field.findById(fieldId);
        if(!field){
            return res.status(400).json("Field not found");
        }
        field.fieldAgent = fieldAgent._id;
        await field.save({new: true, runValidators: true});
        logger.info(`Admin ${req.user.email} assigned field agent${fieldAgent.email} to field ${field.Name}`);
        return res.status(200).json("Field Agent assigned successfully");
    } catch (error) {
        logger.error({message: error.message,
            stack: error.stack.split("\n")[0]
        });
        next(error);
    }
}

// updating of field details by field agent
const updateFieldDetails = async(req, res, next)=>{
    const {notes, currentStage } = req.body;
    try {
        const id = req.params.id;
        if(req.user.role.toLowerCase() !== 'field agent'){
            logger.warn(`Unauthorized field detail update attempt by user ${req.user.email}`);
            return res.status(403).json("This action is forbidden.")
        }
        const field = await Field.findById(id);
        if(!field){
            logger.warn(`User ${req.user.email} attempted to update a non-existent field with id ${req.params.id}`);
            return res.status(400).json("Field not found"); 
        }
        if(field.fieldAgent.toString() !== req.user._id.toString()){
             logger.warn(`Unauthorized field detail update attempt by user ${req.user.email} on field ${field.Name}`);
            return res.status(403).json("You are not assigned to this field");
        }

        if(notes !== undefined){
            field.notes = notes;
        }
        if(currentStage !== undefined){
            field.currentStage = currentStage;
        }

        const negativeKeywords = [
            "disease",
            "pest",
            "drought",
            "flood",
            "infestation",
            "damage",
            "poor growth",
            "wilting",
            "yellowing",
            "stuntd growth",
            "discoloration",
            "leaf spots",
            "mold",
            "fungus",
            "blight",
            "rot",
            "cracking",
            "unhealthy"
        ]
        const positiveKeyWords = [
            "healthy",
            "good growth",
            "vibrant",
            "thriving",
            "strong",
            "lush",
            "blooming",
            "fruiting",
            "flourishing",
            "robust",
            "vigorous",
            "resilient",
            "productive",
            "excellent",
            "outstanding",
            "exceptional",
        ]
        function determineStatus(currentStage, notes){
            const text = notes?.toLowerCase() || '';
            const stage = currentStage?.toLowerCase() || '';
             if(stage === 'harvested'){
            return 'completed';
            }
            else if(negativeKeywords.some(word=>text.includes(word))){
            return 'AtRisk';
            }
            else if(positiveKeyWords.some(word=>text.includes(word))){
            return 'Active';
            }
            else{
            return 'Active';
            }
        }
       const fieldStatus = determineStatus(field.currentStage, field.notes);
       field.fieldStatus = fieldStatus;
       
        await field.save({runValidators: true, new: true});
        const updateRecorder = await UpdatesRecorder.create({
            fieldId: field._id,
            updatedBy: req.user._id,
            message: "Field details updated",
            changes: {
                notes: field.notes,
                currentStage: field.currentStage,
                fieldStatus: field.fieldStatus
            }
        })
        logger.info(`Field agent ${req.user.email} updated field ${field.Name}`);
        res.status(200).json({"Field details updated successfully": field});
    } catch (error) {
        logger.error({message: error.message, stack: error.stack.split("\n")[0]});
        next(error);
    }
}

// viewing of all fields by admin only
const viewAllFields = async(req, res, next)=>{
    try {
        if(req.user.role.toLowerCase() !== 'admin'){
            logger.warn(`Unauthorized attempt to view all fields by user ${req.user.email}`);
            return res.status(403).json("This action is forbidden.");
        }
        const filter = {};
        if(req.query.status){
            filter.fieldStatus = req.query.status?.toLowerCase();
        }
        if(req.query.currentStage){
            filter.currentStage = req.query.currentStage?.toLowerCase();
        }
        const totalFields = await Field.countDocuments(filter);
        const limit = parseInt(req.query.limit) || 10;
        const totalPages = Math.ceil(totalFields / limit);
        const page = parseInt(req.query.page) || 1;
        if(page<1 || (totalPages >0 && page > totalPages)){
            logger.warn(`Invalid page number ${page} requested by user ${req.user.email}`);
            return res.status(400).json("Invalid page number");
        }
        const skip = (page - 1) * limit;
        const fields = await Field.find(filter).skip(skip).limit(limit).populate('fieldAgent', 'name email');
        res.status(200).json({totalFields,
            totalPages,
            currentPage: page,
            filter,
            fields
        });
    } catch (error) {
        logger.error({message: error.message, stack: error.stack.split("\n")[0]});
        next(error);
    }
}

// monitoring updates of fields by admin only
const monitorFieldUpdates = async(req, res, next)=>{
    try {
        if(req.user.role.toLowerCase() !== 'admin'){
            logger.warn(`Unauthorized attempt to monitor field updates by user ${req.user.email}`);
            return res.status(403).json("This action is forbidden.");
        }
        // check if any of the fields have been updated by the field agent
        const updates = await UpdatesRecorder.find().populate('fieldId', 'Name').populate('updatedBy', 'name email'); 
        if(updates.length === 0){
            return res.status(200).json("No updates have been made to any field yet");
        }
        res.status(200).json(updates);
    } catch (error) {
        logger.error({message: error.message, stack: error.stack.split("\n")[0]});
        next(error);
    }
}

// view assigned fields by field agent
const viewAssignedFields = async(req, res, next)=>{
    try {
        if(req.user.role.toLowerCase() !== 'field agent'){
            return res.status(403).json("The action is forbidden");
        }
        const totalFields = await Field.countDocuments({fieldAgent: req.user._id});
        const limit = parseInt(req.query.limit) || 10;
        const totalPages = Math.ceil(totalFields / limit);
        const page = parseInt(req.query.page) || 1;
        if(page < 1 || (totalPages > 0 && page > totalPages)){
            logger.warn(`Invalid page number ${page} requested by user ${req.user.email}`);
            return res.status(400).json("Page not found");
        }
    const skip = (page - 1) * limit;
    const fields = await Field.find({fieldAgent: existingUser._id}).skip(skip).limit(limit);
    if(fields.length === 0){
        return res.status(200).json("No field has been assigned to you yet!");
    }
    else{
        return res.status(200).json({message: "You have been assigned these fields", totalFields, totalPages, page, fields});
    }
    } catch (error) {
        logger.error({message: error.message, stack: error.stack.split("\n")[0]});
        next(error);
    }
}
module.exports = {
    createField,
    assignFieldAgent,
    updateFieldDetails,
    viewAllFields,
    monitorFieldUpdates,
    viewAssignedFields
};