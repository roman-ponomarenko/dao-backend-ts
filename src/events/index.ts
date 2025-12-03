import {logger} from "../logger";
import {config} from "../config/config";
import {ethers} from "ethers";
import daoAbi from "../abis/DAO.json";
import {Proposal, storage, Vote} from "../models/storage";

const provider = new ethers.JsonRpcProvider(config.RPC_URL);
const daoContract = new ethers.Contract(config.DAO_ADDRESS, daoAbi, provider);

async function getBlockTimestamp(blockNumber: number) {
    try {
        const block = await provider.getBlock(blockNumber);
        if (block) {
            logger.debug(`Timestamp of block ${blockNumber}: ${block.timestamp}`);
            return block.timestamp;
        } else {
            logger.error(`Block ${blockNumber} not found.`);
            return null;
        }
    } catch (error) {
        logger.error(`Error fetching block timestamp: ${error}`);
        return null;
    }
}

async function handleVotedEvents(events: any) {
    try {
        for (const event of events) {
            const [proposalId, voter, support, amount] = event.args;
            const eventBlockTimeStamp = await getBlockTimestamp(event.blockNumber);

            logger.debug("Voted event has been detected:");
            logger.debug(`Proposal id: ${proposalId.toString()}`);
            logger.debug(`Voter: ${voter}`);
            logger.debug(`Support: ${support}`);
            logger.debug(`Amount: ${amount}`);
            logger.debug(`Event: ${event.args}`);
            logger.debug(`Event: ${event.blockNumber}`);

            const proposal = storage.proposals.get(proposalId.toString());
            if (!proposal) {
                logger.error(`Proposal with ID:${proposalId.toString()} not found.`);
                continue;
            }

            const proposalVotesCount = proposal.votes.length;

            const vote: Vote = {
                id: proposalVotesCount + 1,
                voter: voter,
                support: support,
                amount: amount.toString(),
                blockNumber: event.blockNumber,
                timestamp: eventBlockTimeStamp ? new Date(eventBlockTimeStamp * 1000).toISOString() : null,
                transactionHash: event.transactionHash
            }
            proposal.votes.push(vote);
            proposal.voteCountFor = support ? String(BigInt(proposal.voteCountFor) + BigInt(amount)) : proposal.voteCountFor;
            proposal.voteCountAgainst = !support ? String(BigInt(proposal.voteCountAgainst) + BigInt(amount)) : proposal.voteCountAgainst;
        }
    } catch (e) {
        logger.error(`Error handling voted events: ${e}`);
    }
}

async function handleProposalExecutedEvents(events: any) {
    for (const event of events) {
        try {
            const [proposalId, executor] = event.args;
            const eventBlockTimeStamp = await getBlockTimestamp(event.blockNumber);

            logger.debug("ProposalExecuted event has been detected:");
            logger.debug(`Proposal id: ${proposalId.toString()}`);
            logger.debug(`Event: ${event.args}`);
            logger.debug(`Event: ${event.blockNumber}`);

            const proposal = storage.proposals.get(proposalId.toString());
            if (!proposal) {
                logger.error(`Proposal with ID:${proposalId.toString()} not found.`);
                continue;
            }

            proposal.executed = true;
            proposal.executedAt = eventBlockTimeStamp ? new Date(eventBlockTimeStamp * 1000).toISOString() : null;
            storage.totalExecutedProposals++;
        } catch (e) {
            logger.error(`Error handling proposal executed events: ${e}`);
        }
    }
}

async function handleProposalCreatedEvents(events: any) {
    for (const event of events) {
        try {
            const [id, creator, description] = event.args;
            const eventBlockTimeStamp = await getBlockTimestamp(event.blockNumber);

            logger.debug("ProposalCreated event has been detected:");
            logger.debug(`Proposal id: ${id.toString()}`);
            logger.debug(`Proposal creator: ${creator}`);
            logger.debug(`Proposal description: ${description}`);
            logger.debug(`Event: ${event.args}`);
            logger.debug(`Event: ${event.blockNumber}`);

            const proposal: Proposal = {
                id: event.args.id.toString(),
                creator: creator,
                description: description,
                startBlock: event.blockNumber,
                createdAt: eventBlockTimeStamp ? new Date(eventBlockTimeStamp * 1000).toISOString() : null,
                endBlock: null,
                executedAt: null,
                executed: null,
                voteCountFor: "0",
                voteCountAgainst: "0",
                transactionHash: event.transactionHash,
                votes: []
            }
            storage.proposals.set(id.toString(), proposal);
            storage.totalProposals++;
        } catch (e) {
            logger.error(`Error handling proposal created events: ${e}`);
        }
    }
}

export async function loadHistoricalEvents() {
    logger.info("Loading historical events...");
    try {
        const currentBlock: number = await provider.getBlockNumber();
        const fromBlock = config.START_BLOCK;
        const toBlock = currentBlock;
        const blockToScan = toBlock - fromBlock + 1;
        const batches = Math.ceil(blockToScan / config.BATCH_SIZE);

        let allProposalCreatedEvents = [];
        let allProposalExecutedEvents = [];
        let allVotedEvents = [];

        for (let i = 0; i < batches; i++) {
            const batchFromBlock = fromBlock + i * config.BATCH_SIZE;
            const batchToBlock = Math.min(batchFromBlock + config.BATCH_SIZE - 1, toBlock);

            logger.debug(`Processing batch ${i + 1} of ${batches} from block ${batchFromBlock} to block ${batchToBlock}`);

            const [proposalCreatedEvents, proposalExecutedEvents, votedEvents] = await Promise.all([
                daoContract.queryFilter("ProposalCreated", batchFromBlock, batchToBlock),
                daoContract.queryFilter("ProposalExecuted", batchFromBlock, batchToBlock),
                daoContract.queryFilter("Voted", batchFromBlock, batchToBlock)
            ]);
            allProposalCreatedEvents.push(...proposalCreatedEvents);
            allProposalExecutedEvents.push(...proposalExecutedEvents);
            allVotedEvents.push(...votedEvents);
        }

        logger.info(`Detected ${allProposalCreatedEvents.length} ProposalCreated events`);
        logger.info(`Detected ${allVotedEvents.length} VotedEvents events`);
        logger.info(`Detected ${allProposalExecutedEvents.length} ProposalExecuted events`);

        if (allProposalCreatedEvents.length > 0) {
            await handleProposalCreatedEvents(allProposalCreatedEvents);
        }

        if (allProposalExecutedEvents.length > 0) {
            await handleVotedEvents(allVotedEvents);
        }

        if (allVotedEvents.length > 0) {
            await handleProposalExecutedEvents(allProposalExecutedEvents);
        }

        storage.lastBlockProcessed = toBlock;
        logger.info(`Historical block loaded successfully. Last block processed: ${storage.lastBlockProcessed}`);
    } catch (error) {
        logger.error(`Error during loading historical events: ${error}`);
        process.exit(1);
    }
}

export async function poolForEvents() {
    try {
        const fromBlock = storage.lastBlockProcessed + 1;
        const currentBlock = await provider.getBlockNumber();

        logger.debug(`Pooling for events from ${fromBlock} to ${currentBlock} blocks`);

        if (fromBlock > currentBlock) {
            return;
        }

        const [proposalCreatedEvents, proposalExecutedEvents, votedEvents] = await Promise.all([
            daoContract.queryFilter("ProposalCreated", fromBlock, currentBlock),
            daoContract.queryFilter("ProposalExecuted", fromBlock, currentBlock),
            daoContract.queryFilter("Voted", fromBlock, currentBlock)
        ]);

        if (proposalCreatedEvents.length > 0) {
            logger.info(`Detected ${proposalCreatedEvents.length} ProposalCreated events`);
            await handleProposalCreatedEvents(proposalCreatedEvents);
        }

        if (votedEvents.length > 0) {
            logger.info(`Detected ${votedEvents.length} VotedEvents events`);
            await handleVotedEvents(votedEvents);
        }

        if (proposalExecutedEvents.length > 0) {
            logger.info(`Detected ${proposalExecutedEvents.length} ProposalExecuted events`);
            await handleProposalExecutedEvents(proposalExecutedEvents);
        }

        storage.lastBlockProcessed = currentBlock;
    } catch (e) {
        logger.error(`Error during pooling for events: ${e}`);
    }
}