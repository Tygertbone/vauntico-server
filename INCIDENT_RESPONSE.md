# Vauntico Incident Response Procedures

## Severity Levels

- **SEV-0**: Complete service outage, all users affected
- **SEV-1**: Critical feature failure, most users affected
- **SEV-2**: Significant degradation, some users affected
- **SEV-3**: Minor issues, few users affected

## Response Times

- **SEV-0**: 15 minutes response, 1 hour resolution
- **SEV-1**: 30 minutes response, 4 hours resolution
- **SEV-2**: 1 hour response, 24 hours resolution
- **SEV-3**: 4 hours response, 72 hours resolution

## Escalation Matrix

| Severity | Primary     | Secondary        | Executive        |
| -------- | ----------- | ---------------- | ---------------- |
| SEV-0    | DevOps Lead | CTO              | CEO              |
| SEV-1    | DevOps Lead | Engineering Lead | CTO              |
| SEV-2    | On-call Eng | DevOps Lead      | Engineering Lead |
| SEV-3    | On-call Eng | Team Lead        | DevOps Lead      |

## Communication Channels

- **Internal**: Slack #incidents
- **External**: Status page updates
- **Executive**: Email + Slack
