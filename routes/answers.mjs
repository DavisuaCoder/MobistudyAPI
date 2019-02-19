'use strict'

/**
* This provides the API endpoints for the study answers of the participants.
*/

import express from 'express'
import passport from 'passport'
import getDB from '../DB/DB'
import { applogger } from '../logger'
import auditLogger from '../auditLogger'

const router = express.Router()

export default async function () {
  var db = await getDB()

  router.get('/answers', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      if (req.user.role === 'researcher') {
        // extra check about the teams
        if (req.query.teamKey) {
          let team = await db.getOneTeam(req.query.teamKey)
          if (!team.researchersKeys.includes(req.user._key)) return res.sendStatus(403)
          else {
            let answers = await db.getAllAnswers()
            res.send(answers)
          }
        }
        if (req.query.studyKey) {
          let team = await db.getAllTeams(req.user._key, req.query.studyKey)
          if (team.length === 0) return res.sendStatus(403)
          else {
            let answers = await db.getAnswerByStudy(req.query.studyKey)
            res.send(answers)
          }
        }
      }
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve answers')
      res.sendStatus(500)
    }
  })

  router.get('/answers/:answer_key', passport.authenticate('jwt', { session: false }), async function (req, res) {
    try {
      // TODO: do some access control
      let answer = await db.getOneAnswer(req.params.answer_key)
      res.send(answer)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot retrieve answer with _key ' + req.params.answer_key)
      res.sendStatus(500)
    }
  })

  router.post('/answers', passport.authenticate('jwt', { session: false }), async function (req, res) {
    let newanswer = req.body
    if (req.user.role !== 'participant') return res.sendStatus(403)
    if (!newanswer.generatedTS) return res.sendStatus(400)
    newanswer.userKey = req.user._key
    newanswer.createdTS = new Date()
    try {
      newanswer = await db.createAnswer(newanswer)
      // also update task status
      let participant = await db.getParticipantByUserKey(req.params.userKey)
      if (!participant) return res.status(404)

      let study = participant.studies.find((s) => {
        return s.studyKey === newanswer.studyKey
      })
      if (!study) return res.status(400)
      let taskItem = study.taskItemsConsent.find(ti => ti.taskId === newanswer.taskId)
      if (!taskItem) return res.status(400)
      taskItem.lastExecuted = newanswer.generatedTS
      // update the participant
      await db.replaceParticipant(participant._key, participant)
      res.send(newanswer)

      applogger.info({ userKey: req.user._key, taskId: newanswer.taskId, studyKey: newanswer.studyKey }, 'Participant has sent answers to a form')
      auditLogger.log('answersCreated', req.user._key, newanswer.studyKey, newanswer.taskId, 'Form answers created by participant with key ' + participant._key + ' for study with key ' + newanswer.studyKey, 'answers', newanswer._key, newanswer)
    } catch (err) {
      applogger.error({ error: err }, 'Cannot store new answer')
      res.sendStatus(500)
    }
  })

  return router
}
