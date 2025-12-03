import {Request, Response, NextFunction} from 'express';
import {storage, Proposal} from '../models/storage';

export const getProposals = (req: Request, res: Response, next: NextFunction) => {
    try {
        const proposals: Omit<Proposal, "votes">[] = Array.from(storage.proposals.values())
            .map(({ votes, ...proposalWithoutVotes }) => proposalWithoutVotes);
        res.json({
            success: true,
            count: proposals.length,
            data: proposals,
        });
    } catch (error) {
        next(error);
    }
};

export const getProposalById = (req: Request, res: Response, next: NextFunction) => {
    try {
        const proposal = storage.proposals.get(req.params.id);
        if (!proposal) {
            return res.status(404).json({error: 'Proposal not found'});
        }
        res.json({
            success: true,
            data: proposal
        });
    } catch (error) {
        next(error);
    }
};

export const getProposalVotes = (req: Request, res: Response, next: NextFunction) => {
    try {
        const proposal = storage.proposals.get(req.params.id);
        if (!proposal) {
            return res.status(404).json({error: 'Proposal not found'});
        }
        res.json({
            success: true,
            count: proposal.votes.length,
            data: proposal.votes
        });
    } catch (error) {
        next(error);
    }
};