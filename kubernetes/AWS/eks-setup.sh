eksctl create nodegroup --cluster=ithustapp --region=ap-southeast-1 --name=ithustapp-node --subnet-ids=subnet-071f3010bc2ab02b2,subnet-0d6690d32ec4e8213 --node-type=t3.medium --nodes=4 --nodes-min=4 --nodes-max=6 --node-volume-size=20 --ssh-access --ssh-public-key=ithust-kube --managed --asg-access --external-dns-access --full-ecr-access --appmesh-access --alb-ingress-access --node-private-networking

eksctl utils associate-iam-oidc-provider --cluster=ithustapp --region=ap-southeast-1 --approve
$ eksctl create cluster --name=ithustapp --region=ap-southeast-1 --vpc-private-subnets=subnet-071f3010bc2ab02b2,subnet-0d6690d32ec4e8213 --without-nodegroup

https://elastic:X3g5hWC3iwfaOn32iDCG4Bx3@c131932aa68c487ebefb849e56804b28.asia-southeast1.gcp.elastic-cloud.com:443
elastic
X3g5hWC3iwfaOn32iDCG4Bx3

https://ithustapp-ee03f1.apm.asia-southeast1.gcp.elastic-cloud.com