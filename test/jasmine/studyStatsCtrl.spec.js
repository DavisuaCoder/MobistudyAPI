import studyStatsCtrl from '../../src/controllers/studyStatsCtrl.mjs'
import { DAL } from '../../src/DAL/DAL.mjs'
import { applogger } from '../../src/services/logger.mjs'
import { MockResponse } from '../mocks/MockResponse.mjs'

describe('Testing studies stats controller,', () => {

  beforeAll(async () => {
    // extend the DAL object
    await DAL.extendDAL()

    // mock app logger
    spyOnAllFunctions(applogger)
  }, 100)

  it('no study key no party', async () => {
    let res = new MockResponse()
    await studyStatsCtrl.getLastTasksSummary({
      user: {
        role: 'researcher'
      },
      params: {
      }
    }, res)
    expect(res.code).toBe(400)
  })

  it('participants cannot access study stats', async () => {
    spyOn(DAL, 'getOneStudy').and.returnValue({
      _key: 'fake'
    })
    let res = new MockResponse()
    await studyStatsCtrl.getLastTasksSummary({
      user: {
        role: 'participant'
      },
      query: {
        studyKey: '1978'
      }
    }, res)

    expect(res.code).toBe(403)
  })

  it('researchers can access their studies stats', async () => {
    spyOn(DAL, 'getOneStudy').and.returnValue({
      _key: 'fake'
    })
    spyOn(DAL, 'getAllTeams').and.returnValue([{}])
    spyOn(DAL, 'getLastTasksSummary').and.returnValue([{
      userKey: '1122',
      name: 'Dario',
      surname: 'Salvi',
      DOB: '1994-06-04',
      userEmail: 'dario@test.test',
      status: 'accepted',
      taskResultCount: 3,
      lastTaskDate: null,
      lastTaskType: null
    }])

    let res = new MockResponse()
    await studyStatsCtrl.getLastTasksSummary({
      user: {
        role: 'researcher'
      },
      query: {
        studyKey: 'fake'
      }
    }, res)

    expect(res.data).not.toBeNull()
    expect(res.data).not.toBeUndefined()
    expect(res.data.length).toBe(1)
    expect(res.data[0].userKey).toBe('1122')
  })

  it('researchers can filter by name', async () => {
    spyOn(DAL, 'getOneStudy').and.returnValue({
      _key: 'fake'
    })
    spyOn(DAL, 'getAllTeams').and.returnValue([{}])
    spyOn(DAL, 'getLastTasksSummary').and.returnValue([{
      userKey: '1122',
      name: 'Dario',
      surname: 'Salvi',
      DOB: '1994-06-04',
      userEmail: 'dario@test.test',
      status: 'accepted',
      taskResultCount: 3,
      lastTaskDate: null,
      lastTaskType: null
    }])

    let res = new MockResponse()
    await studyStatsCtrl.getLastTasksSummary({
      user: {
        role: 'researcher'
      },
      query: {
        studyKey: 'fake',
        participantName: 'dar'
      }
    }, res)

    expect(res.data).not.toBeNull()
    expect(res.data).not.toBeUndefined()
    expect(res.data.length).toBe(1)
    expect(res.data[0].userKey).toBe('1122')

    expect(DAL.getLastTasksSummary).toHaveBeenCalledOnceWith('fake', 'dar', undefined, undefined, undefined)
  })
})
