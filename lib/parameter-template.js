"use strict";

const templates = {
    userVideo: opt => ([
        {
            "ping": {
                "content": "rs:0"
            }
        },
        {
            "ping": {
                "content": "ps:0"
            }
        },
        {
            "thread": {
                "thread": opt.threadId,
                "version": "20090904",
                "fork": 0,
                "language": 0,
                "user_id": opt.userId,
                "with_global": 1,
                "scores": 1,
                "nicoru": 0,
                "userkey": opt.userKey
            }
        },
        {
            "ping": {
                "content": "pf:0"
            }
        },
        {
            "ping": {
                "content": "ps:1"
            }
        },
        {
            "thread_leaves": {
                "thread": opt.threadId,
                "language": 0,
                "user_id": opt.userId,
                "content": "0-5:100,1000",
                "scores": 1,
                "nicoru": 0,
                "userkey": opt.userKey
            }
        },
        {
            "ping": {
                "content": "pf:1"
            }
        },
        {
            "ping": {
                "content": "rf:0"
            }
        }
    ]),
    channelVideo: opt => ([
        {
			"ping": {
				"content": "rs:0"
			}
		},
		{
			"ping": {
				"content": "ps:0"
			}
		},
		{
			"thread": {
				"thread": opt.threadId,
				"version": "20090904",
				"fork": 0,
				"language": 0,
				"user_id": opt.userId,
				"with_global": 1,
				"scores": 1,
				"nicoru": 0,
				"userkey": opt.userKey
			}
		},
		{
			"ping": {
				"content": "pf:0"
			}
		},
		{
			"ping": {
				"content": "ps:1"
			}
		},
		{
			"thread_leaves": {
				"thread": opt.threadId,
				"language": 0,
				"user_id": opt.userId,
				"content": "0-24:100,1000",
				"scores": 1,
				"nicoru": 0,
				"userkey": opt.userKey
			}
		},
		{
			"ping": {
				"content": "pf:1"
			}
		},
		{
			"ping": {
				"content": "ps:2"
			}
		},
		{
			"thread": {
				"thread": opt.threadId,
				"version": "20090904",
				"fork": 0,
				"language": 0,
				"user_id": opt.userId,
				"force_184": "1",
				"with_global": 1,
				"scores": 1,
				"nicoru": 0,
				"threadkey": opt.threadKey
			}
		},
		{
			"ping": {
				"content": "pf:2"
			}
		},
		{
			"ping": {
				"content": "ps:3"
			}
		},
		{
			"thread_leaves": {
				"thread": opt.threadId,
				"language": 0,
				"user_id": opt.userId,
				"content": "0-24:100,1000",
				"scores": 1,
				"nicoru": 0,
				"force_184": "1",
				"threadkey": opt.threadKey
			}
		},
		{
			"ping": {
				"content": "pf:3"
			}
		},
		{
			"ping": {
				"content": "rf:0"
			}
		}
    ])
};

module.exports = templates;