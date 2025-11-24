import { Router } from 'express';
import {
    getProposals,
    getProposalById,
    getProposalVotes
} from '../controllers/proposals';

const router = Router();

router.get('/', getProposals);
router.get('/:id', getProposalById);
router.get('/:id/votes', getProposalVotes);

export default router;