import groovy.json.JsonOutput

def readCommitAuthor() {
    sh '''#!/bin/bash
        git rev-parse HEAD | tr '\n' ' ' > gitCommit
        git show --format="%aN <%aE>" ${gitCommit} | head -1 | tr '\n' ' ' > gitCommitAuthor
    '''
    return readFile('gitCommitAuthor')
}

def durationTime(m1, m2) {
    int timecase = m2 - m1

    int seconds = (int) (timecase / 1000)
    int minutes = (int) (timecase / (60*1000))
    int hours = (int) (timecase / (1000*60*60))

    return hours.mod(24) + "h " + minutes.mod(60) + "m " + seconds.mod(60) + "s"
}

def findPodsFromName(String namespace, String name) {
    podsAndImagesRaw = sh(
        script: """
            kubectl get pods -n ${namespace} --selector=app=${name} -o jsonpath='{range .items[*]}{.metadata.name}###'
        """,
        returnStdout: true
    ).trim()
    wantedPods = podsAndImagesRaw.split('###')

    return wantedPods
}

def notifySlack(text, channel, attachments) {
    // Check directly against env to avoid storing in local string first
    if (!env.SLACK_WEBHOOK_URL) {
        echo 'notifySlack: SLACK_WEBHOOK_URL chưa được set, bỏ qua gửi Slack.'
        return
    }
    
    def jenkinsIcon = 'https://a.slack-edge.com/205a/img/services/jenkins-ci_72.png'

    def payload = JsonOutput.toJson([
        text: text,
        channel: channel,
        username: "jenkins",
        icon_url: jenkinsIcon,
        attachments: attachments
    ])

    // Use withEnv to safely inject the JSON payload as an environment variable
    withEnv(["SLACK_PAYLOAD=${payload}"]) {
        // Use SINGLE QUOTES (''') so Groovy doesn't interpolate the secret.
        // Bash will securely read $SLACK_WEBHOOK_URL and $SLACK_PAYLOAD
        sh '''
            curl -s -X POST "$SLACK_WEBHOOK_URL" \
                 -H "Cache-Control: no-cache" \
                 -H "Content-Type: application/json;charset=UTF-8" \
                 -d "$SLACK_PAYLOAD"
        '''
    }
}

return this