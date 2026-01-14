import { Router, type Router as ExpressRouter } from "express";
import { ubuntuCouncilService } from "../services/ubuntuCouncilService";
import { apiAuthMiddleware } from "../middleware/auth";
import logger from "../utils/logger";

const router: ExpressRouter = Router();

// Get all council members
router.get("/members", apiAuthMiddleware, async (req, res) => {
  try {
    const members = await ubuntuCouncilService.getCouncilMembers();
    res.json({
      success: true,
      data: members,
      count: members.length,
    });
  } catch (error) {
    logger.error("Error fetching council members:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch council members",
    });
  }
});

// Add a new council member
router.post("/members", apiAuthMiddleware, async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        error: "User ID is required",
      });
    }

    const member = await ubuntuCouncilService.addCouncilMember(userId);
    res.status(201).json({
      success: true,
      data: member,
      message: "Council member added successfully",
    });
  } catch (error) {
    logger.error("Error adding council member:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to add council member",
    });
  }
});

// Get proposals
router.get("/proposals", apiAuthMiddleware, async (req, res) => {
  try {
    const { status, limit = 50, offset = 0 } = req.query;

    const proposals = await ubuntuCouncilService.getProposals(
      status as any,
      parseInt(limit as string),
      parseInt(offset as string),
    );

    res.json({
      success: true,
      data: proposals,
      count: proposals.length,
      pagination: {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
      },
    });
  } catch (error) {
    logger.error("Error fetching proposals:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch proposals",
    });
  }
});

// Create a new proposal
router.post("/proposals", apiAuthMiddleware, async (req, res) => {
  try {
    const proposalData = {
      ...req.body,
      createdBy: req.user?.userId,
    };

    // Validate required fields
    const requiredFields = ["title", "description", "type"];
    for (const field of requiredFields) {
      if (!proposalData[field]) {
        return res.status(400).json({
          success: false,
          error: `${field} is required`,
        });
      }
    }

    const proposal = await ubuntuCouncilService.createProposal(proposalData);
    res.status(201).json({
      success: true,
      data: proposal,
      message: "Proposal created successfully",
    });
  } catch (error) {
    logger.error("Error creating proposal:", error);
    res.status(500).json({
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to create proposal",
    });
  }
});

// Cast a vote on a proposal
router.post("/votes", apiAuthMiddleware, async (req, res) => {
  try {
    const voteData = {
      ...req.body,
      userId: req.user?.userId,
    };

    // Validate required fields
    const requiredFields = ["proposalId", "vote"];
    for (const field of requiredFields) {
      if (!voteData[field]) {
        return res.status(400).json({
          success: false,
          error: `${field} is required`,
        });
      }
    }

    // Validate vote value
    if (!["yes", "no", "abstain"].includes(voteData.vote)) {
      return res.status(400).json({
        success: false,
        error: "Vote must be yes, no, or abstain",
      });
    }

    const vote = await ubuntuCouncilService.castVote(voteData);
    res.status(201).json({
      success: true,
      data: vote,
      message: "Vote cast successfully",
    });
  } catch (error) {
    logger.error("Error casting vote:", error);
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : "Failed to cast vote",
    });
  }
});

// Get audit trail
router.get("/audit", apiAuthMiddleware, async (req, res) => {
  try {
    const { entityId, entityType, limit = 100 } = req.query;

    const auditTrail = await ubuntuCouncilService.getAuditTrail(
      entityId as string,
      entityType as any,
      parseInt(limit as string),
    );

    res.json({
      success: true,
      data: auditTrail,
      count: auditTrail.length,
    });
  } catch (error) {
    logger.error("Error fetching audit trail:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch audit trail",
    });
  }
});

// Get council statistics
router.get("/stats", apiAuthMiddleware, async (req, res) => {
  try {
    const members = await ubuntuCouncilService.getCouncilMembers();
    const activeProposals = await ubuntuCouncilService.getProposals("active");
    const completedProposals =
      await ubuntuCouncilService.getProposals("completed");

    const stats = {
      totalMembers: members.length,
      activeMembers: members.filter((m) => m.isActive).length,
      totalVotingWeight: members.reduce((sum, m) => sum + m.votingWeight, 0),
      averageTrustScore:
        members.length > 0
          ? members.reduce((sum, m) => sum + m.trustScore, 0) / members.length
          : 0,
      activeProposals: activeProposals.length,
      completedProposals: completedProposals.length,
      memberDistribution: {
        lowTrust: members.filter((m) => m.trustScore < 750).length,
        mediumTrust: members.filter(
          (m) => m.trustScore >= 750 && m.trustScore < 850,
        ).length,
        highTrust: members.filter((m) => m.trustScore >= 850).length,
      },
    };

    res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    logger.error("Error fetching council stats:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch council statistics",
    });
  }
});

export default router;
